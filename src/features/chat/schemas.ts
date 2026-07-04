import { z } from "zod"

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Escreva uma mensagem").max(2000, "Mensagem muito longa"),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const chatRequestSchema = z
  .object({
    conversationId: z.string().min(1),
    content: z.string().max(2000, "Mensagem muito longa").optional(),
    regenerateMessageId: z.string().optional(),
  })
  .refine((data) => data.regenerateMessageId || (data.content && data.content.length > 0), {
    message: "Escreva uma mensagem",
    path: ["content"],
  })

export type ChatRequestInput = z.infer<typeof chatRequestSchema>

export const renameConversationSchema = z.object({
  title: z.string().min(1, "Informe um título").max(80, "Título muito longo"),
})

export type RenameConversationInput = z.infer<typeof renameConversationSchema>

export const MESSAGE_FEEDBACK_VALUES = ["LIKE", "DISLIKE"] as const

export const reactToMessageSchema = z.object({
  feedback: z.enum(MESSAGE_FEEDBACK_VALUES).nullable(),
})

export type ReactToMessageInput = z.infer<typeof reactToMessageSchema>
