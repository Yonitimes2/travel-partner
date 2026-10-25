import { Gate } from "@/components/AppShell";
import { ChatList } from "@/components/Chats";

export default function ChatsPage() {
  return (
    <Gate>
      <ChatList />
    </Gate>
  );
}
