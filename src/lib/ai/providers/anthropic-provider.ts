import Anthropic from "@anthropic-ai/sdk"

import { FINANCIAL_ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts/financial-assistant"
import type { AIProvider } from "@/lib/ai/types"

/**
 * Scaffolded but not the MVP default (see lib/ai/provider.ts) — proves the
 * AIProvider interface works end to end. Activate by setting AI_PROVIDER=anthropic
 * and ANTHROPIC_API_KEY in the environment.
 */
export const anthropicProvider: AIProvider = {
  async chat({ messages, context }) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const contextLines = [
      context?.recentTransactionsSummary,
      context?.goalsSummary,
    ].filter(Boolean)

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: [FINANCIAL_ASSISTANT_SYSTEM_PROMPT, ...contextLines].join("\n\n"),
      messages: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    })

    const textBlock = response.content.find((block) => block.type === "text")

    return {
      content: textBlock?.type === "text" ? textBlock.text : "",
      providerLabel: `anthropic:${response.model}`,
      metadata: { usage: response.usage },
    }
  },
}
