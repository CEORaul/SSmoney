import { mockProvider } from "@/lib/ai/providers/mock-provider"
import { anthropicProvider } from "@/lib/ai/providers/anthropic-provider"
import { geminiProvider } from "@/lib/ai/providers/gemini-provider"
import type { AIProvider } from "@/lib/ai/types"

/**
 * Anthropic is the production default. AI_PROVIDER=gemini swaps to Google's
 * Gemini API (same AIProvider abstraction, different implementation file —
 * nothing outside lib/ai/providers/* changes). AI_PROVIDER=mock opts into
 * canned responses for local work without any API key.
 */
export function getAIProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "mock") {
    return mockProvider
  }

  if (process.env.AI_PROVIDER === "gemini") {
    return geminiProvider
  }

  return anthropicProvider
}
