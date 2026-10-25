import { Suspense } from "react";
import { Gate } from "@/components/AppShell";
import { ChatView } from "@/components/Chats";

export default function ChatPage({ params }: PageProps<"/[lang]/chat/[id]">) {
  return (
    <Suspense>
      <Chat params={params} />
    </Suspense>
  );
}

async function Chat({ params }: Pick<PageProps<"/[lang]/chat/[id]">, "params">) {
  const { id } = await params;
  return (
    <Gate>
      <ChatView id={id} />
    </Gate>
  );
}
