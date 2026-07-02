export type ChatMessageInput = {
  role: "user" | "assistant" | "system"
  content: string
}

/** Structured context to ground future prompts; unused by the mock provider. */
export type AIChatContext = {
  recentTransactionsSummary?: string
  goalsSummary?: string
}

export type AIChatResult = {
  content: string
  providerLabel: string
  metadata?: Record<string, unknown>
}

export interface AIProvider {
  chat(params: {
    messages: ChatMessageInput[]
    context?: AIChatContext
  }): Promise<AIChatResult>
}
