"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreateConversation } from "@/app/dashboard/messages/actions";
import { Button } from "@/components/ui/button";

export function MessageProButton({ bookingId }: { bookingId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    const result = await getOrCreateConversation(bookingId);
    if (result.success && result.data) {
      const { conversationId } = result.data as { conversationId: number };
      router.push(`/dashboard/messages?conversation=${conversationId}`);
    } else {
      setError(result.error || "Failed to open conversation");
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30 mt-2"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="mr-1 h-4 w-4" />
        )}
        Message Pro
      </Button>
      {error && (
        <p className="text-xs text-red-500 mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
