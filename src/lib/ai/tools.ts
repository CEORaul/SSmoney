/**
 * Scaffold for future tool use — NOT wired into any provider call yet.
 *
 * These definitions follow the Anthropic Messages API tool-definition shape
 * (`name` + `description` + `input_schema`) so they can be dropped directly
 * into a future `tools: [...]` array on `client.messages.create`/`.stream`
 * without reshaping. Nothing in this file is imported anywhere else in the
 * codebase — adding a `tools` param to `AIProvider.chat`/`chatStream` and
 * wiring actual handlers (querying transactions, creating goals/bills,
 * editing categories) is deliberately out of scope until requested.
 */

export type ToolDefinition = {
  name: string
  description: string
  input_schema: {
    type: "object"
    properties: Record<string, unknown>
    required?: string[]
  }
}

export const FUTURE_TOOLS: ToolDefinition[] = [
  {
    name: "consultar_transacoes",
    description:
      "Consulta as transações do usuário em um período, opcionalmente filtrando por categoria ou tipo (receita/despesa).",
    input_schema: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "Data inicial (ISO 8601)" },
        endDate: { type: "string", description: "Data final (ISO 8601)" },
        categoryId: { type: "string", description: "ID da categoria, se filtrar por uma específica" },
        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "criar_meta",
    description: "Cria uma nova meta financeira para o usuário.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome da meta" },
        targetAmountCents: { type: "integer", description: "Valor alvo em centavos" },
        targetDate: { type: "string", description: "Prazo da meta (ISO 8601), opcional" },
      },
      required: ["name", "targetAmountCents"],
    },
  },
  {
    name: "adicionar_transacao",
    description: "Registra uma nova transação (receita ou despesa) para o usuário.",
    input_schema: {
      type: "object",
      properties: {
        description: { type: "string" },
        amountCents: { type: "integer", description: "Valor em centavos" },
        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
        categoryId: { type: "string" },
        date: { type: "string", description: "Data da transação (ISO 8601)" },
      },
      required: ["description", "amountCents", "type", "date"],
    },
  },
  {
    name: "criar_conta_a_pagar",
    description: "Cria uma nova conta a pagar (bill) para o usuário.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        amountCents: { type: "integer", description: "Valor em centavos" },
        dueDate: { type: "string", description: "Data de vencimento (ISO 8601)" },
        categoryId: { type: "string" },
      },
      required: ["name", "amountCents", "dueDate"],
    },
  },
  {
    name: "editar_categoria",
    description: "Edita o nome, cor ou ícone de uma categoria existente do usuário.",
    input_schema: {
      type: "object",
      properties: {
        categoryId: { type: "string" },
        name: { type: "string" },
        color: { type: "string" },
        icon: { type: "string" },
      },
      required: ["categoryId"],
    },
  },
]
