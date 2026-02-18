import { z } from "zod";

export const TweetDataSchema = z.object({
  tweet_id: z.string(),
  author_handle: z.string(),
  author_name: z.string(),
  author_followers: z.number().int().nonnegative(),
  author_verified: z.boolean(),
  content: z.string().max(10000),
  timestamp: z.string().datetime(),
  likes: z.number().int().nonnegative(),
  retweets: z.number().int().nonnegative(),
  replies: z.number().int().nonnegative(),
  quotes: z.number().int().nonnegative(),
  media_urls: z.array(z.string().url()).default([]),
  is_thread: z.boolean(),
  thread_position: z.number().int().optional(),
  parent_tweet_id: z.string().optional(),
  urls: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
});

export const RawCaptureSchema = z.object({
  capture_id: z.string().uuid(),
  source_feed: z.string(),
  captured_at: z.string().datetime(),
  agent_version: z.string(),
  tweets: z.array(TweetDataSchema).max(500),
  metadata: z.object({
    scroll_depth: z.number(),
    capture_duration_ms: z.number(),
    total_extracted: z.number().int(),
  }),
  signature: z.string(),
  timestamp: z.number(),
  nonce: z.string().uuid(),
});
