export type ChatMessageInput = {
  role: "user" | "assistant" | "system"
  content: string
}

/**
 * Structured context that grounds the assistant in the user's real data
 * (built by `buildFinancialContext` in `lib/ai/context.ts`); unused by the
 * mock provider. Future data sources (e.g. Open Finance accounts) extend
 * this type with new optional fields — the provider interface itself never
 * needs to change.
 */
export type AIChatContext = {
  recentTransactionsSummary?: string
  goalsSummary?: string
  billsSummary?: string
  netWorthSummary?: string
  monthClosingSummary?: string
  retrospectiveSummary?: string
  categoriesSummary?: string
  overdueBillsSummary?: string
  recurringBillsSummary?: string
}

export type AIChatResult = {
  content: string
  providerLabel: string
  metadata?: Record<string, unknown>
}

export type AIStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; result: AIChatResult }
  | { type: "error"; message: string }

export interface AIProvider {
  chat(params: {
    messages: ChatMessageInput[]
    context?: AIChatContext
  }): Promise<AIChatResult>
  /**
   * Streaming counterpart of `chat`. An async generator keeps the Anthropic
   * SDK's own streaming primitives fully encapsulated in the provider file —
   * callers (the chat Route Handler) only ever see `AIStreamEvent`.
   */
  chatStream(params: {
    messages: ChatMessageInput[]
    context?: AIChatContext
    signal?: AbortSignal
  }): AsyncIterable<AIStreamEvent>
}
