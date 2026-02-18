import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";

let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}

const MODEL_MAP = {
  "claude-haiku": "claude-haiku-4-5-20251001",
  "claude-sonnet": "claude-sonnet-4-6",
} as const;

type ModelAlias = keyof typeof MODEL_MAP;

interface ExtractOptions<T> {
  model: ModelAlias;
  system: string;
  prompt: string;
  schema: ZodType<T>;
  maxTokens?: number;
}

interface ExtractSuccess<T> {
  data: T;
  tokensUsed: number;
}

interface ExtractError {
  error: string;
  tokensUsed: number;
}

export type ExtractResult<T> = ExtractSuccess<T> | ExtractError;

export async function extractStructured<T>(
  options: ExtractOptions<T>
): Promise<ExtractResult<T>> {
  const { model, system, prompt, schema, maxTokens = 4096 } = options;

  try {
    const response = await getClient().messages.create({
      model: MODEL_MAP[model],
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: "structured_output",
          description:
            "Output the structured data extracted from the input. Always use this tool to provide your response.",
          input_schema: {
            type: "object" as const,
            properties: {
              data: {
                type: "object" as const,
                description: "The extracted structured data",
              },
            },
            required: ["data"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "structured_output" },
    });

    const tokensUsed =
      (response.usage?.input_tokens ?? 0) +
      (response.usage?.output_tokens ?? 0);

    const toolBlock = response.content.find(
      (block) => block.type === "tool_use"
    );
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return { error: "No tool_use block in response", tokensUsed };
    }

    const raw = (toolBlock.input as { data: unknown }).data;
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return {
        error: `Schema validation failed: ${JSON.stringify(parsed.error.issues ?? parsed.error, null, 2).slice(0, 500)}`,
        tokensUsed,
      };
    }

    return { data: parsed.data as T, tokensUsed };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
      tokensUsed: 0,
    };
  }
}
