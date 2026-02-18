export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alpha_cards: {
        Row: {
          blueprint: Json | null
          category: string
          cluster_id: string
          created_at: string
          direction: string
          entities: string[]
          evidence: Json | null
          expires_at: string
          friction_detail: string | null
          id: string
          momentum_score: number
          opportunity_window: string | null
          risk_factors: string[] | null
          signal_count: number
          status: string
          strategy: string | null
          thesis: string | null
          title: string
        }
        Insert: {
          blueprint?: Json | null
          category: string
          cluster_id: string
          created_at?: string
          direction: string
          entities: string[]
          evidence?: Json | null
          expires_at: string
          friction_detail?: string | null
          id?: string
          momentum_score: number
          opportunity_window?: string | null
          risk_factors?: string[] | null
          signal_count?: number
          status?: string
          strategy?: string | null
          thesis?: string | null
          title: string
        }
        Update: {
          blueprint?: Json | null
          category?: string
          cluster_id?: string
          created_at?: string
          direction?: string
          entities?: string[]
          evidence?: Json | null
          expires_at?: string
          friction_detail?: string | null
          id?: string
          momentum_score?: number
          opportunity_window?: string | null
          risk_factors?: string[] | null
          signal_count?: number
          status?: string
          strategy?: string | null
          thesis?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alpha_cards_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "pattern_clusters"
            referencedColumns: ["cluster_id"]
          },
        ]
      }
      ingest_nonces: {
        Row: {
          created_at: string
          nonce: string
        }
        Insert: {
          created_at?: string
          nonce: string
        }
        Update: {
          created_at?: string
          nonce?: string
        }
        Relationships: []
      }
      pattern_clusters: {
        Row: {
          cluster_id: string
          created_at: string
          direction: string
          entities: string[]
          evidence_tweet_ids: string[]
          first_seen: string
          friction_density: number
          id: string
          momentum_delta: number
          momentum_score: number
          window_hours: number
        }
        Insert: {
          cluster_id?: string
          created_at?: string
          direction: string
          entities: string[]
          evidence_tweet_ids?: string[]
          first_seen: string
          friction_density?: number
          id?: string
          momentum_delta?: number
          momentum_score: number
          window_hours: number
        }
        Update: {
          cluster_id?: string
          created_at?: string
          direction?: string
          entities?: string[]
          evidence_tweet_ids?: string[]
          first_seen?: string
          friction_density?: number
          id?: string
          momentum_delta?: number
          momentum_score?: number
          window_hours?: number
        }
        Relationships: []
      }
      pipeline_runs: {
        Row: {
          captures_processed: number
          completed_at: string | null
          created_at: string
          errors: string[]
          id: string
          l1_stats: Json
          l2_stats: Json
          l3_stats: Json
          started_at: string
          status: string
          total_tokens_used: number
        }
        Insert: {
          captures_processed?: number
          completed_at?: string | null
          created_at?: string
          errors?: string[]
          id?: string
          l1_stats?: Json
          l2_stats?: Json
          l3_stats?: Json
          started_at?: string
          status?: string
          total_tokens_used?: number
        }
        Update: {
          captures_processed?: number
          completed_at?: string | null
          created_at?: string
          errors?: string[]
          id?: string
          l1_stats?: Json
          l2_stats?: Json
          l3_stats?: Json
          started_at?: string
          status?: string
          total_tokens_used?: number
        }
        Relationships: []
      }
      processed_tweet_ids: {
        Row: {
          capture_id: string
          processed_at: string
          tweet_id: string
        }
        Insert: {
          capture_id: string
          processed_at?: string
          tweet_id: string
        }
        Update: {
          capture_id?: string
          processed_at?: string
          tweet_id?: string
        }
        Relationships: []
      }
      raw_captures: {
        Row: {
          agent_version: string
          capture_id: string
          captured_at: string
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          source_feed: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_version: string
          capture_id: string
          captured_at: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload: Json
          source_feed: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_version?: string
          capture_id?: string
          captured_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          source_feed?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      scrubber_outputs: {
        Row: {
          capture_id: string
          created_at: string
          entities: Json
          friction_points: Json
          id: string
          notable_tweets: Json
          processed_at: string
          total_input: number
          total_passed: number
        }
        Insert: {
          capture_id: string
          created_at?: string
          entities?: Json
          friction_points?: Json
          id?: string
          notable_tweets?: Json
          processed_at: string
          total_input: number
          total_passed: number
        }
        Update: {
          capture_id?: string
          created_at?: string
          entities?: Json
          friction_points?: Json
          id?: string
          notable_tweets?: Json
          processed_at?: string
          total_input?: number
          total_passed?: number
        }
        Relationships: [
          {
            foreignKeyName: "scrubber_outputs_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "raw_captures"
            referencedColumns: ["capture_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          status: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          stripe_customer_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_nonces: { Args: never; Returns: undefined }
      expire_old_alpha_cards: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
