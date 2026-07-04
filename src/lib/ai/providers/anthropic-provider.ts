import Anthropic from "@anthropic-ai/sdk"

import { envNumber } from "@/lib/ai/env"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import type { AIChatContext, AIProvider, AIStreamEvent, ChatMessageInput } from "@/lib/ai/types"

const MISSING_KEY_REPLY =
  "O assistente ainda não está configurado neste ambiente — falta a chave de API da Anthropic. Avise quem administra o sistema."
const RATE_LIMIT_REPLY =
  "Estou recebendo muitas solicitações agora. Aguarde um instante e tente novamente."
const CONNECTION_REPLY =
  "Não consegui me conectar ao assistente. Verifique sua conexão e tente novamente."
const UNAVAILABLE_REPLY =
  "Não consegui falar com o assistente agora. Tente novamente em instantes."

const DEFAULT_MODEL = "claude-opus-4-8"
const DEFAULT_MAX_TOKENS = 2048
const DEFAULT_TEMPERATURE = 0.4
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_TIMEOUT_MS = 60_000

function errorReply(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return MISSING_KEY_REPLY
  if (error instanceof Anthropic.RateLimitError) return RATE_LIMIT_REPLY
  if (error instanceof Anthropic.APIConnectionError) return CONNECTION_REPLY
  if (error instanceof Anthropic.APIError) return UNAVAILABLE_REPLY
  return UNAVAILABLE_REPLY
}

function toAnthropicMessages(messages: ChatMessageInput[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
}

function createClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: envNumber("ANTHROPIC_MAX_RETRIES", DEFAULT_MAX_RETRIES),
    timeout: envNumber("ANTHROPIC_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
  })
}

function requestParams(messages: ChatMessageInput[], context?: AIChatContext) {
  return {
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: envNumber("ANTHROPIC_MAX_TOKENS", DEFAULT_MAX_TOKENS),
    temperature: envNumber("ANTHROPIC_TEMPERATURE", DEFAULT_TEMPERATURE),
    system: buildSystemPrompt(context),
    messages: toAnthropicMessages(messages),
  }
}

export const anthropicProvider: AIProvider = {
  async chat({ messages, context }) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { content: MISSING_KEY_REPLY, providerLabel: "anthropic:missing-key" }
    }

    try {
      const client = createClient()
      const response = await client.messages.create(requestParams(messages, context))
      const textBlock = response.content.find((block) => block.type === "text")

      return {
        content: textBlock?.type === "text" ? textBlock.text : "",
        providerLabel: `anthropic:${response.model}`,
        metadata: { usage: response.usage },
      }
    } catch (error) {
      return { content: errorReply(error), providerLabel: "anthropic:error" }
    }
  },

  async *chatStream({ messages, context, signal }): AsyncIterable<AIStreamEvent> {
    if (!process.env.ANTHROPIC_API_KEY) {
      const content = MISSING_KEY_REPLY
      yield { type: "delta", text: content }
      yield { type: "done", result: { content, providerLabel: "anthropic:missing-key" } }
      return
    }

    const client = createClient()

    try {
      const stream = client.messages.stream(requestParams(messages, context), { signal })

      let full = ""
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          full += event.delta.text
          yield { type: "delta", text: event.delta.text }
        }
      }

      const finalMessage = await stream.finalMessage()

      yield {
        type: "done",
        result: {
          content: full,
          providerLabel: `anthropic:${finalMessage.model}`,
          metadata: { usage: finalMessage.usage },
        },
      }
    } catch (error) {
      // An aborted signal (user cancelled) is not a real error — the caller
      // already has whatever partial text was yielded via "delta" events.
      if (signal?.aborted) return
      yield { type: "error", message: errorReply(error) }
    }
  },
}
