import { ApiError, GoogleGenAI } from "@google/genai"

import { envNumber } from "@/lib/ai/env"
import { buildSystemPrompt } from "@/lib/ai/system-prompt"
import type { AIChatContext, AIProvider, AIStreamEvent, ChatMessageInput } from "@/lib/ai/types"

const MISSING_KEY_REPLY =
  "O assistente ainda não está configurado neste ambiente — falta a chave de API do Gemini. Avise quem administra o sistema."
const RATE_LIMIT_REPLY =
  "Estou recebendo muitas solicitações agora. Aguarde um instante e tente novamente."
const UNAVAILABLE_REPLY =
  "Não consegui falar com o assistente agora. Tente novamente em instantes."

const DEFAULT_MODEL = "gemini-2.5-flash"
// Financial breakdowns with numbered steps/bold headers routinely run past
// 2048 tokens and were getting cut off mid-sentence with no indication to
// the user — 2048 was too low for this assistant's typical response shape.
const DEFAULT_MAX_TOKENS = 8192
const DEFAULT_TEMPERATURE = 0.4
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_TIMEOUT_MS = 60_000

function errorReply(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return MISSING_KEY_REPLY
    if (error.status === 429) return RATE_LIMIT_REPLY
  }
  return UNAVAILABLE_REPLY
}

function toGeminiContents(messages: ChatMessageInput[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
}

function createClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      timeout: envNumber("GEMINI_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
      retryOptions: { attempts: envNumber("GEMINI_MAX_RETRIES", DEFAULT_MAX_RETRIES) },
    },
  })
}

function requestParams(messages: ChatMessageInput[], context?: AIChatContext, signal?: AbortSignal) {
  return {
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    contents: toGeminiContents(messages),
    config: {
      systemInstruction: buildSystemPrompt(context),
      temperature: envNumber("GEMINI_TEMPERATURE", DEFAULT_TEMPERATURE),
      maxOutputTokens: envNumber("GEMINI_MAX_TOKENS", DEFAULT_MAX_TOKENS),
      abortSignal: signal,
    },
  }
}

function providerLabel() {
  return `gemini:${process.env.GEMINI_MODEL || DEFAULT_MODEL}`
}

export const geminiProvider: AIProvider = {
  async chat({ messages, context }) {
    if (!process.env.GEMINI_API_KEY) {
      return { content: MISSING_KEY_REPLY, providerLabel: "gemini:missing-key" }
    }

    try {
      const client = createClient()
      const response = await client.models.generateContent(requestParams(messages, context))

      return {
        content: response.text ?? "",
        providerLabel: providerLabel(),
        metadata: { usage: response.usageMetadata },
      }
    } catch (error) {
      return { content: errorReply(error), providerLabel: "gemini:error" }
    }
  },

  async *chatStream({ messages, context, signal }): AsyncIterable<AIStreamEvent> {
    if (!process.env.GEMINI_API_KEY) {
      const content = MISSING_KEY_REPLY
      yield { type: "delta", text: content }
      yield { type: "done", result: { content, providerLabel: "gemini:missing-key" } }
      return
    }

    const client = createClient()
    let full = ""

    try {
      const stream = await client.models.generateContentStream(requestParams(messages, context, signal))

      for await (const chunk of stream) {
        if (signal?.aborted) return
        const text = chunk.text
        if (text) {
          full += text
          yield { type: "delta", text }
        }
      }

      yield {
        type: "done",
        result: { content: full, providerLabel: providerLabel() },
      }
    } catch (error) {
      // An aborted signal (user cancelled) is not a real error — the caller
      // already has whatever partial text was yielded via "delta" events.
      if (signal?.aborted) return
      yield { type: "error", message: errorReply(error) }
    }
  },
}
