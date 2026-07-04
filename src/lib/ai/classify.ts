import type { Topic } from "@/lib/ai/context"

export type Classification = {
  needsUserData: boolean
  topics: Topic[]
}

const PERSONAL_KEYWORDS = [
  "meu",
  "minha",
  "meus",
  "minhas",
  "eu tenho",
  "eu gasto",
  "eu gastei",
  "gastei",
  "economizei",
  "economizo",
  "recebi",
  "ganhei",
  "sobra",
  "posso gastar",
  "posso investir",
  "vale a pena eu",
  "devo comprar",
]

const GENERIC_QUESTION_PATTERNS = [
  /\bo que (é|significa)\b/,
  /\bcomo funciona\b/,
  /\bexplique\b/,
  /\bdiferença entre\b/,
  /\bqual a diferença\b/,
  /\bpara que serve\b/,
]

const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  overview: ["saldo", "gasto", "gastos", "receita", "receitas", "despesa", "despesas", "quanto gasto", "categoria de gasto"],
  goals: ["meta", "metas", "objetivo", "objetivos", "guardar dinheiro", "poupar para"],
  bills: ["conta", "contas", "vencid", "vencimento", "recorrente", "recorrência", "boleto", "pagar"],
  netWorth: ["patrimônio", "patrimonio", "investimento", "investimentos", "ativo", "ativos", "dívida", "divida", "dívidas", "dividas", "carro", "imóvel", "imovel"],
  monthClosing: ["fechamento", "mês fechado", "fechou o mês"],
  retrospective: ["retrospectiva", "ano todo", "esse ano", "este ano"],
  categories: ["categorias cadastradas", "minhas categorias"],
}

function includesAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle))
}

/**
 * Decides, before any database query runs, whether a question depends on the
 * user's real financial data or is a general finance-education question
 * (e.g. "o que é um ETF?"). Errs toward `needsUserData: true` with a cheap
 * "overview" fetch when ambiguous — a false positive costs one extra set of
 * already-fast Prisma queries, while a false negative would mean answering a
 * personal question with no data at all.
 */
export function classifyQuestion(latestMessage: string, recentMessages: string[] = []): Classification {
  const text = [latestMessage, ...recentMessages].join(" ").toLowerCase()

  const hasPersonalKeyword = includesAny(text, PERSONAL_KEYWORDS)
  const matchedTopics = (Object.keys(TOPIC_KEYWORDS) as Topic[]).filter((topic) =>
    includesAny(text, TOPIC_KEYWORDS[topic])
  )

  const looksGeneric = GENERIC_QUESTION_PATTERNS.some((pattern) => pattern.test(text))

  if (looksGeneric && !hasPersonalKeyword && matchedTopics.length === 0) {
    return { needsUserData: false, topics: [] }
  }

  if (matchedTopics.length > 0) {
    return { needsUserData: true, topics: matchedTopics }
  }

  if (hasPersonalKeyword) {
    return { needsUserData: true, topics: ["overview"] }
  }

  if (looksGeneric) {
    return { needsUserData: false, topics: [] }
  }

  // Ambiguous — default to the cheap overview fetch rather than answering
  // a possibly-personal question with zero context.
  return { needsUserData: true, topics: ["overview"] }
}
