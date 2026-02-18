import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

import { extractStructured } from "./ai";

const TestSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
});

describe("extractStructured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed data on valid response", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "structured_output",
          input: { data: { name: "Test", score: 85 } },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const result = await extractStructured({
      model: "claude-haiku",
      system: "Test system",
      prompt: "Test prompt",
      schema: TestSchema,
    });

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toEqual({ name: "Test", score: 85 });
      expect(result.tokensUsed).toBe(150);
    }
  });

  it("returns error on schema validation failure", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "structured_output",
          input: { data: { name: "Test", score: 150 } },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const result = await extractStructured({
      model: "claude-haiku",
      system: "Test system",
      prompt: "Test prompt",
      schema: TestSchema,
    });

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("Schema validation failed");
    }
  });

  it("returns error when no tool_use block in response", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Some text response" }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const result = await extractStructured({
      model: "claude-haiku",
      system: "Test system",
      prompt: "Test prompt",
      schema: TestSchema,
    });

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("No tool_use block");
    }
  });

  it("returns error on API exception", async () => {
    mockCreate.mockRejectedValue(new Error("Rate limit exceeded"));

    const result = await extractStructured({
      model: "claude-sonnet",
      system: "Test system",
      prompt: "Test prompt",
      schema: TestSchema,
    });

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBe("Rate limit exceeded");
      expect(result.tokensUsed).toBe(0);
    }
  });

  it("handles null data in tool_use input", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "structured_output",
          input: { data: null },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const result = await extractStructured({
      model: "claude-haiku",
      system: "Test system",
      prompt: "Test prompt",
      schema: TestSchema,
    });

    expect("error" in result).toBe(true);
  });

  it("handles partial/empty response", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "tool_use",
          id: "tool_1",
          name: "structured_output",
          input: { data: {} },
        },
      ],
      usage: { input_tokens: 50, output_tokens: 10 },
    });

    const result = await extractStructured({
      model: "claude-haiku",
      system: "Test",
      prompt: "Test",
      schema: TestSchema,
    });

    expect("error" in result).toBe(true);
  });
});
