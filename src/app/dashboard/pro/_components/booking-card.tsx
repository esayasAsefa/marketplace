"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, CalendarDays, Loader2, MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateBookingStatus } from "../actions";
import { getOrCreateConversation } from "../../messages/actions";

type BookingCardProps = {
  booking: {
    id: number;
    status: string;
    scheduledDate: string;
    customerPhone: string | null;
    locationLat: string | null;
    locationLng: string | null;
    notes: string | null;
    createdAt: string;
    customerName: string | null;
    customerEmail: string;
    serviceTitle: string;
  };
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle2 },
  declined: { label: "Declined", variant: "destructive", icon: XCircle },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
};

export function BookingCard({ booking }: BookingCardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [error, setError] = useState<string | null>(null);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const router = useRouter();

  const handleStatusUpdate = async (newStatus: "accepted" | "declined" | "completed") => {
    setIsUpdating(newStatus);
    setError(null);
    const result = await updateBookingStatus(booking.id, newStatus);
    if (result.success) {
      setCurrentStatus(newStatus);
    } else {
      setError(result.error || "Failed to update");
    }
    setIsUpdating(null);
  };

  const handleMessage = async () => {
    setMessagingLoading(true);
    const result = await getOrCreateConversation(booking.id);
    if (result.success && result.data) {
      const { conversationId } = result.data as { conversationId: number };
      router.push(`/dashboard/messages?conversation=${conversationId}`);
    } else {
      setError(result.error || "Failed to open conversation");
      setMessagingLoading(false);
    }
  };

  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const scheduledDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(booking.scheduledDate));

  const initials = booking.customerName
    ? booking.customerName.substring(0, 2).toUpperCase()
    : booking.customerEmail.substring(0, 2).toUpperCase();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="font-semibold">{booking.customerName || "Customer"}</p>
            <p className="text-xs text-muted-foreground">{booking.serviceTitle}</p>
          </div>
        </div>
        <Badge variant={config.variant} className="shrink-0">
          <StatusIcon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-brand-500 shrink-0" />
          {scheduledDate}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 text-brand-500 shrink-0" />
          <span className="truncate">{booking.customerEmail}</span>
        </div>
        {booking.customerPhone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-brand-500 shrink-0" />
            {booking.customerPhone}
          </div>
        )}
        {booking.locationLat && booking.locationLng && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
            <a
              href={`https://www.openstreetmap.org/?mlat=${booking.locationLat}&mlon=${booking.locationLng}#map=16/${booking.locationLat}/${booking.locationLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-brand-600"
            >
              View on Map
            </a>
          </div>
        )}
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="mb-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 mb-1 font-medium text-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Notes
          </div>
          <p className="whitespace-pre-line">{booking.notes}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {/* Actions */}
      {currentStatus === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleStatusUpdate("accepted")}
            disabled={!!isUpdating}
          >
            {isUpdating === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
            onClick={() => handleStatusUpdate("declined")}
            disabled={!!isUpdating}
          >
            {isUpdating === "declined" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
            Decline
          </Button>
        </div>
      )}
      {currentStatus === "accepted" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400"
            onClick={() => handleStatusUpdate("completed")}
            disabled={!!isUpdating}
          >
            {isUpdating === "completed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
            Mark as Completed
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400"
            onClick={handleMessage}
            disabled={messagingLoading}
          >
            {messagingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="mr-1 h-4 w-4" />}
            Message
          </Button>
        </div>
      )}
      {(currentStatus === "completed" || currentStatus === "pending") && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30 mt-2"
          onClick={handleMessage}
          disabled={messagingLoading}
        >
          {messagingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="mr-1 h-4 w-4" />}
          Message Customer
        </Button>
      )}
    </div>
  );
}
