import { mockProvider } from "@/lib/ai/providers/mock-provider"
import { anthropicProvider } from "@/lib/ai/providers/anthropic-provider"
import type { AIProvider } from "@/lib/ai/types"

export function getAIProvider(): AIProvider {
  const configured = process.env.AI_PROVIDER

  if (configured === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return anthropicProvider
  }

  return mockProvider
}
