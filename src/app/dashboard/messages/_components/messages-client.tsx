"use client";

import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import type { ConversationItem } from "../actions";

export function MessagesClient({
  conversations,
  currentUserId,
  initialConversationId,
}: {
  conversations: ConversationItem[];
  currentUserId: string;
  initialConversationId?: number;
}) {
  const initial = initialConversationId
    ? conversations.find((c) => c.id === initialConversationId) ?? null
    : null;

  const [activeConvo, setActiveConvo] = useState<ConversationItem | null>(
    initial
  );
  const [showChat, setShowChat] = useState(!!initial);

  const handleSelect = (convo: ConversationItem) => {
    setActiveConvo(convo);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-3xl border border-border/60 bg-card shadow-xl overflow-hidden">
      {/* Sidebar — hidden on mobile when chat is open */}
      <div
        className={`w-full md:w-[360px] md:border-r md:border-border/60 shrink-0 ${
          showChat ? "hidden md:flex md:flex-col" : "flex flex-col"
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConvo?.id ?? null}
          currentUserId={currentUserId}
          onSelect={handleSelect}
        />
      </div>

      {/* Chat area — hidden on mobile when chat is closed */}
      <div
        className={`flex-1 min-w-0 ${
          showChat ? "flex flex-col" : "hidden md:flex md:flex-col"
        }`}
      >
        <ChatWindow
          conversation={activeConvo}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
