-- ScoutAgent: Initial Schema (applied via Supabase MCP)
-- This file is a local record of the migration applied to Supabase.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE raw_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id text UNIQUE NOT NULL,
  source_feed text NOT NULL,
  captured_at timestamptz NOT NULL,
  agent_version text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_raw_captures_status ON raw_captures (status);
CREATE INDEX idx_raw_captures_captured_at ON raw_captures (captured_at DESC);

CREATE TABLE scrubber_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id text NOT NULL REFERENCES raw_captures(capture_id) ON DELETE CASCADE,
  processed_at timestamptz NOT NULL,
  total_input integer NOT NULL,
  total_passed integer NOT NULL,
  entities jsonb NOT NULL DEFAULT '[]',
  friction_points jsonb NOT NULL DEFAULT '[]',
  notable_tweets jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scrubber_outputs_capture ON scrubber_outputs (capture_id);
CREATE INDEX idx_scrubber_outputs_processed ON scrubber_outputs (processed_at DESC);

CREATE TABLE pattern_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  entities text[] NOT NULL,
  momentum_score numeric NOT NULL CHECK (momentum_score >= 0 AND momentum_score <= 100),
  momentum_delta numeric NOT NULL DEFAULT 0,
  direction text NOT NULL CHECK (direction IN ('rising', 'falling', 'stable')),
  evidence_tweet_ids text[] NOT NULL DEFAULT '{}',
  friction_density numeric NOT NULL DEFAULT 0 CHECK (friction_density >= 0 AND friction_density <= 1),
  first_seen timestamptz NOT NULL,
  window_hours numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pattern_clusters_momentum ON pattern_clusters (momentum_score DESC);
CREATE INDEX idx_pattern_clusters_direction ON pattern_clusters (direction);
CREATE INDEX idx_pattern_clusters_first_seen ON pattern_clusters (first_seen DESC);

CREATE TABLE alpha_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'archived')),
  title text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('momentum_shift', 'friction_opportunity', 'emerging_tool', 'contrarian_signal')),
  entities text[] NOT NULL,
  momentum_score numeric NOT NULL CHECK (momentum_score >= 0 AND momentum_score <= 100),
  direction text NOT NULL CHECK (direction IN ('rising', 'falling', 'stable')),
  signal_count integer NOT NULL DEFAULT 0,
  thesis text,
  strategy text,
  risk_factors text[],
  evidence jsonb,
  friction_detail text,
  opportunity_window text,
  cluster_id uuid NOT NULL REFERENCES pattern_clusters(cluster_id) ON DELETE CASCADE
);

CREATE INDEX idx_alpha_cards_status ON alpha_cards (status);
CREATE INDEX idx_alpha_cards_category ON alpha_cards (category);
CREATE INDEX idx_alpha_cards_expires ON alpha_cards (expires_at);
CREATE INDEX idx_alpha_cards_momentum ON alpha_cards (momentum_score DESC);
CREATE INDEX idx_alpha_cards_created ON alpha_cards (created_at DESC);

CREATE TABLE pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  captures_processed integer NOT NULL DEFAULT 0,
  l1_stats jsonb NOT NULL DEFAULT '{"input":0,"passed":0,"failed":0}',
  l2_stats jsonb NOT NULL DEFAULT '{"clusters_found":0,"clusters_qualifying":0}',
  l3_stats jsonb NOT NULL DEFAULT '{"briefs_generated":0,"failed":0}',
  total_tokens_used integer NOT NULL DEFAULT 0,
  errors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE processed_tweet_ids (
  tweet_id text PRIMARY KEY,
  capture_id text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ingest_nonces (
  nonce uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingest_nonces_created ON ingest_nonces (created_at);

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- RLS
ALTER TABLE raw_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrubber_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_tweet_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_nonces ENABLE ROW LEVEL SECURITY;

ALTER TABLE alpha_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active alpha cards"
  ON alpha_cards FOR SELECT TO authenticated
  USING (status = 'active' AND expires_at > now());

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_updated_at_raw_captures BEFORE UPDATE ON raw_captures FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_user_profiles BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_subscriptions BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ingest_nonces WHERE created_at < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION expire_old_alpha_cards()
RETURNS void AS $$
BEGIN
  UPDATE public.alpha_cards SET status = 'expired' WHERE status = 'active' AND expires_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
