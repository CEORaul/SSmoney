const MAX_TITLE_LENGTH = 40

/**
 * Cheap default for auto-titling a new conversation — truncates the user's
 * first message at a word boundary. No extra LLM call: this is a cosmetic
 * feature, not worth the added latency/cost/failure-mode of a dedicated
 * summarization request on every new conversation.
 */
export function deriveConversationTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.trim().replace(/[?!.,;:]+$/, "")
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned

  const truncated = cleaned.slice(0, MAX_TITLE_LENGTH)
  const lastSpace = truncated.lastIndexOf(" ")
  return (lastSpace > 10 ? truncated.slice(0, lastSpace) : truncated).trim()
}
