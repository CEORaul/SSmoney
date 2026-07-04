import { redirect } from "next/navigation";

import { getOrCreateConversation } from "@/features/chat/queries";

export default async function ChatIndexPage() {
  const conversation = await getOrCreateConversation();
  redirect(`/chat/${conversation.id}`);
}
