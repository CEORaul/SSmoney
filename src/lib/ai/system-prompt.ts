import { FINANCIAL_ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts/financial-assistant"
import type { AIChatContext } from "@/lib/ai/types"

/**
 * Shared by every AIProvider implementation — keeps the persona/context
 * assembly identical regardless of which model actually answers.
 */
export function buildSystemPrompt(context?: AIChatContext): string {
  const contextLines = [
    context?.recentTransactionsSummary,
    context?.goalsSummary,
    context?.billsSummary,
    context?.overdueBillsSummary,
    context?.recurringBillsSummary,
    context?.netWorthSummary,
    context?.monthClosingSummary,
    context?.retrospectiveSummary,
    context?.categoriesSummary,
  ].filter(Boolean)

  return [FINANCIAL_ASSISTANT_SYSTEM_PROMPT, ...contextLines].join("\n\n")
}
