import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getAIProvider } from "@/lib/ai/provider";
import { mockProvider } from "@/lib/ai/providers/mock-provider";
import { getOrCreateConversation } from "@/features/chat/queries";
import { ChatWindow } from "@/features/chat/components/ChatWindow";

export default async function ChatPage() {
  const conversation = await getOrCreateConversation();
  const isDemoMode = getAIProvider() === mockProvider;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistente IA"
        description="Tire dúvidas sobre suas finanças"
        actions={
          isDemoMode ? <Badge variant="outline">Assistente em modo demonstração</Badge> : undefined
        }
      />
      <ChatWindow conversationId={conversation.id} initialMessages={conversation.messages} />
    </div>
  );
}
