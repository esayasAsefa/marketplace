"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, ArrowLeft, Loader2, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { sendMessage, markAsRead } from "../actions";
import type { MessageItem, ConversationItem } from "../actions";

export function ChatWindow({
  conversation,
  currentUserId,
  onBack,
}: {
  conversation: ConversationItem | null;
  currentUserId: string;
  onBack: () => void;
}) {
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages  
  const fetchMessages = useCallback(async () => {
    if (!conversation) return;
    try {
      const res = await fetch(
        `/api/messages?conversationId=${conversation.id}`
      );
      if (res.ok) {
        const data: MessageItem[] = await res.json();
        setMessagesList(data);
      }
    } catch (err) {
      console.warn("[ChatWindow] Failed to fetch messages:", err);
    }
  }, [conversation]);

  // Initial load + polling
  useEffect(() => {
    if (!conversation) return;

    setLoading(true);
    setMessagesList([]);

    fetchMessages().then(() => {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    // Mark as read
    markAsRead(conversation.id).catch(() => {});

    // Poll every 3 seconds
    pollRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversation, fetchMessages, scrollToBottom]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messagesList.length, scrollToBottom]);

  const handleSend = async () => {
    if (!conversation || (!input.trim() && !attachment) || sending || uploadingAttachment) return;

    const content = input.trim();
    const currentAttachment = attachment;
    
    setInput("");
    setAttachment(null);
    setSending(true);

    let attachmentUrl: string | undefined = undefined;

    // Optimistic update
    const optimisticMsg: MessageItem = {
      id: Date.now(),
      senderId: currentUserId,
      content,
      attachmentUrl: currentAttachment ? URL.createObjectURL(currentAttachment) : null,
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: "You",
      senderImage: null,
    };
    setMessagesList((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    if (currentAttachment) {
      setUploadingAttachment(true);
      try {
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(currentAttachment.name)}`, {
          method: "POST",
          body: currentAttachment,
        });
        if (res.ok) {
          const data = await res.json();
          attachmentUrl = data.url;
        } else {
          console.error("Failed to upload attachment");
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploadingAttachment(false);
      }
    }

    const result = await sendMessage(conversation.id, content, attachmentUrl);
    if (!result.success) {
      // Remove optimistic message on failure
      setMessagesList((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }

    setSending(false);
    inputRef.current?.focus();

    // Refresh messages
    await fetchMessages();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setAttachment(file);
      } else {
        alert("Only image attachments are currently supported.");
      }
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 mb-6">
          <Send className="h-8 w-8 text-brand-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Your Messages</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Select a conversation from the sidebar to start chatting with a
          professional or customer.
        </p>
      </div>
    );
  }

  const initials = conversation.otherUserName
    ? conversation.otherUserName.substring(0, 2).toUpperCase()
    : conversation.otherUserEmail.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card/50 backdrop-blur-sm px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {conversation.otherUserImage ? (
          <img
            src={conversation.otherUserImage}
            alt={conversation.otherUserName ?? "User"}
            className="h-10 w-10 rounded-xl object-cover border border-border/60"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {conversation.otherUserName || conversation.otherUserEmail}
          </p>
          <p className="text-xs text-brand-500 dark:text-brand-400 truncate">
            {conversation.serviceTitle}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : messagesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {/* Date separator for the first message */}
            <div className="flex items-center justify-center mb-4">
              <span className="text-[11px] text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                {new Date(messagesList[0].createdAt).toLocaleDateString(
                  "en-US",
                  { weekday: "long", month: "short", day: "numeric" }
                )}
              </span>
            </div>
            {messagesList.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/60 bg-card/50 backdrop-blur-sm p-4">
        {attachment && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 w-max max-w-full">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background border border-border/60 flex items-center justify-center">
               <img src={URL.createObjectURL(attachment)} alt="attachment" className="object-cover w-full h-full" />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-medium truncate">{attachment.name}</span>
              <span className="text-[10px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="ml-auto p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/30 border border-border/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            aria-label="Attach image"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-background focus:ring-2 focus:ring-brand-400/20 min-h-[44px] max-h-[120px]"
            style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || sending || uploadingAttachment}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25 transition-all hover:scale-105 hover:shadow-brand-500/40 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            aria-label="Send message"
          >
            {sending || uploadingAttachment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
