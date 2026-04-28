"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
  });
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages[messages.length - 1]?.id;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (!latestMessageId && messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [latestMessageId, messages.length]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-brand-500/50 hover:scale-105 transition-all z-50 animate-bounce-subtle"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
        </span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-[350px] sm:max-w-[400px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <div>
            <h3 className="font-bold">ProNear Assistant</h3>
            <p className="text-xs text-brand-100">AI-powered help</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[400px] min-h-[300px] flex flex-col gap-4 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm my-auto px-4">
            <Bot className="h-10 w-10 mx-auto text-brand-300 opacity-50 mb-2" />
            <p>Hi! I'm your ProNear AI assistant. How can I help you find a professional today?</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                m.role === "user" ? "bg-brand-100 text-brand-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] ${
                m.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-none"
                  : "bg-card border border-border text-card-foreground rounded-tl-none shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {m.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("") || (m as any).text || (m as any).content || ""}
              </p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-card border border-border shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-150" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            The assistant could not respond. Check your AI key and try again.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!input.trim() || isLoading) {
            return;
          }

          sendMessage({ text: input });
          setInput("");
        }}
        className="p-3 bg-card border-t border-border"
      >
        <div className="relative">
          <input
            className="w-full bg-muted text-foreground placeholder:text-muted-foreground rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="absolute right-1 top-1 bottom-1 flex items-center justify-center aspect-square rounded-full bg-brand-600 text-white disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
