"use client";

import { useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import type { ConversationItem } from "../actions";

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
  onSelect,
}: {
  conversations: ConversationItem[];
  activeId: number | null;
  currentUserId: string;
  onSelect: (convo: ConversationItem) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(
    (c) =>
      (c.otherUserName ?? c.otherUserEmail)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      c.serviceTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/30 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-400 focus:bg-background"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "No conversations match your search" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filtered.map((convo) => {
            const isActive = activeId === convo.id;
            const initials = convo.otherUserName
              ? convo.otherUserName.substring(0, 2).toUpperCase()
              : convo.otherUserEmail.substring(0, 2).toUpperCase();

            const timeAgo = formatRelativeTime(convo.lastMessageAt);

            return (
              <button
                type="button"
                key={convo.id}
                onClick={() => onSelect(convo)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-all duration-200 border-b border-border/30 hover:bg-muted/50 ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-950/30 border-l-2 border-l-brand-500"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {convo.otherUserImage ? (
                    <img
                      src={convo.otherUserImage}
                      alt={convo.otherUserName ?? "User"}
                      className="h-11 w-11 rounded-xl object-cover border border-border/60"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                      {initials}
                    </div>
                  )}
                  {convo.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-md animate-pulse-glow">
                      {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-semibold truncate ${convo.unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}>
                      {convo.otherUserName || convo.otherUserEmail}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-brand-500 dark:text-brand-400 font-medium truncate mb-0.5">
                    {convo.serviceTitle}
                  </p>
                  <p className={`text-xs truncate ${convo.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {convo.lastMessageContent || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
