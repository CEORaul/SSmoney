import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { getConversation, listConversations } from "@/features/chat/queries";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { ConversationSidebar } from "@/features/chat/components/ConversationSidebar";
import { MobileConversationSheet } from "@/features/chat/components/MobileConversationSheet";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const result = await getConversation(conversationId);
  if (!result) {
    notFound();
  }

  const { messages, nextCursor } = result;
  const { items: conversations, nextCursor: conversationsCursor } = await listConversations();

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <PageHeader title="Assistente IA" description="Tire dúvidas sobre suas finanças" />
        <MobileConversationSheet
          activeConversationId={conversationId}
          initialConversations={conversations}
          initialCursor={conversationsCursor}
        />
      </div>
      <div className="flex flex-1 overflow-hidden rounded-lg border">
        <aside className="hidden w-64 shrink-0 border-r md:flex">
          <ConversationSidebar
            activeConversationId={conversationId}
            initialConversations={conversations}
            initialCursor={conversationsCursor}
          />
        </aside>
        <div className="min-w-0 flex-1 overflow-hidden">
          <ChatWindow
            conversationId={conversationId}
            initialMessages={messages}
            initialOldestCursor={nextCursor}
          />
        </div>
      </div>
    </div>
  );
}
