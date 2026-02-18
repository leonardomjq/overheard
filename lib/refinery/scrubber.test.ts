import { describe, it, expect } from "vitest";
import { isNoise, hasSignal, filterTweets } from "./scrubber";
import type { TweetData } from "@/types";
import rawCapture from "@/__fixtures__/raw-capture.json";

const tweets = rawCapture.tweets as unknown as TweetData[];

describe("isNoise", () => {
  it("detects giveaway spam", () => {
    expect(isNoise("GIVEAWAY! Follow and retweet to win $500!")).toBe(true);
  });

  it("detects airdrop spam", () => {
    expect(isNoise("Free airdrop for all followers")).toBe(true);
  });

  it("detects follow+retweet spam", () => {
    expect(isNoise("Follow and retweet to win")).toBe(true);
  });

  it("detects check bio spam", () => {
    expect(isNoise("Check my bio for a surprise")).toBe(true);
  });

  it("passes legitimate developer content", () => {
    expect(isNoise("Just migrated our codebase from Webpack to Turbopack")).toBe(false);
  });

  it("passes technical discussion", () => {
    expect(isNoise("The Rust compiler improvements are impressive")).toBe(false);
  });
});

describe("hasSignal", () => {
  it("detects migration signal", () => {
    expect(hasSignal("Migrating from React to Svelte")).toBe(true);
  });

  it("detects performance signal", () => {
    expect(hasSignal("The benchmark results show 10x faster performance")).toBe(true);
  });

  it("detects bug/issue signal", () => {
    expect(hasSignal("Found a critical bug in the new release")).toBe(true);
  });

  it("detects framework mention", () => {
    expect(hasSignal("The new React server components are game-changing")).toBe(true);
  });

  it("rejects non-technical content", () => {
    expect(hasSignal("Had a great lunch today at the cafe")).toBe(false);
  });

  it("detects deprecation signal", () => {
    expect(hasSignal("They are deprecating the old API")).toBe(true);
  });
});

describe("filterTweets", () => {
  it("filters out noise tweets", () => {
    const filtered = filterTweets(tweets);
    const noiseIds = filtered.map((t) => t.tweet_id);
    expect(noiseIds).not.toContain("tweet-noise-001");
  });

  it("keeps signal tweets", () => {
    const filtered = filterTweets(tweets);
    const ids = filtered.map((t) => t.tweet_id);
    expect(ids).toContain("tweet-001");
    expect(ids).toContain("tweet-002");
    expect(ids).toContain("tweet-003");
    expect(ids).toContain("tweet-004");
  });

  it("returns fewer tweets than input", () => {
    const filtered = filterTweets(tweets);
    expect(filtered.length).toBeLessThan(tweets.length);
  });
});
