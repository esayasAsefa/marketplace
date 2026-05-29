import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { stackServerApp } from "@/stack";
import { syncCurrentUser } from "@/lib/sync-user";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getConversations } from "./actions";
import { MessagesClient } from "./_components/messages-client";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const stackUser = (await stackServerApp.getUser())!;

  try {
    await syncCurrentUser();
  } catch {}

  const conversations = await getConversations();
  const params = await searchParams;
  const initialConversationId = params.conversation
    ? parseInt(params.conversation)
    : undefined;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 pt-32 pb-24">
          <div className="absolute inset-0 mesh-gradient opacity-40 mix-blend-overlay" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-brand-200 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-1">
                  Messages
                </h1>
                <p className="text-brand-200 text-lg">
                  Chat with your professionals and customers
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -translate-y-12 relative z-20">
          {conversations.length === 0 && !initialConversationId ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-card p-16 text-center shadow-xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-brand-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                When you book a service or receive a booking, you can start a
                conversation with the other party right from your dashboard.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:scale-105"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          ) : (
            <MessagesClient
              conversations={conversations}
              currentUserId={stackUser.id}
              initialConversationId={initialConversationId}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
