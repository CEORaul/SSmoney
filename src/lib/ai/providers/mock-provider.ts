import type { AIProvider, AIStreamEvent, ChatMessageInput } from "@/lib/ai/types"

const KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["gastar", "posso gastar", "sobra"],
    reply:
      "Ainda estou aprendendo a calcular isso com precisão — em breve vou olhar seu saldo e próximos vencimentos antes de responder. Por enquanto, consulte o Dashboard para ver seu saldo atual.",
  },
  {
    keywords: ["economizei", "economia", "poupei"],
    reply:
      "Sua economia do mês aparece no Dashboard e no Fechamento do Mês. Em breve vou conseguir resumir isso diretamente aqui no chat.",
  },
  {
    keywords: ["onde gasto mais", "categoria", "maior gasto"],
    reply:
      "Dá para ver isso agora no gráfico de gastos por categoria do Dashboard. Estou me preparando para te dar essa resposta diretamente aqui em breve.",
  },
  {
    keywords: ["economizar", "reduzir gasto", "cortar"],
    reply:
      "Ótima pergunta! Ainda não tenho recomendações personalizadas prontas, mas isso está a caminho — vou analisar seus hábitos e sugerir cortes específicos.",
  },
]

const FALLBACK_REPLY =
  "Ainda estou aprendendo a te ajudar com isso — em breve terei respostas mais inteligentes! Enquanto isso, explore o Dashboard, Metas e Fechamento do Mês."

function pickReply(messages: ChatMessageInput[]): string {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.content.toLowerCase()

  if (!lastUserMessage) return FALLBACK_REPLY

  const match = KEYWORD_REPLIES.find(({ keywords }) =>
    keywords.some((keyword) => lastUserMessage.includes(keyword))
  )

  return match?.reply ?? FALLBACK_REPLY
}

export const mockProvider: AIProvider = {
  async chat({ messages }) {
    return {
      content: pickReply(messages),
      providerLabel: "mock",
    }
  },

  async *chatStream({ messages }): AsyncIterable<AIStreamEvent> {
    const content = pickReply(messages)
    yield { type: "delta", text: content }
    yield { type: "done", result: { content, providerLabel: "mock" } }
  },
}
