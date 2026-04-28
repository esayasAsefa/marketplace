"use client";

import { useActionState, useState } from "react";
import { Zap, CalendarDays, CheckCircle2, AlertCircle, MapPin, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { requestBooking, type BookingFormState } from "../actions";

type BookingFormProps = {
  serviceId: number;
  hourlyRate: string;
  defaultPhone?: string;
  defaultLocation?: { lat: number; lng: number } | null;
};

export function BookingForm({ serviceId, hourlyRate, defaultPhone, defaultLocation }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState<
    BookingFormState,
    FormData
  >(requestBooking, { success: false });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(defaultLocation || null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [scheduleSuggestion, setScheduleSuggestion] = useState<{ time: string, reason: string } | null>(null);
  
  const [notes, setNotes] = useState("");
  const [isSuggestingNotes, setIsSuggestingNotes] = useState(false);

  const handleSuggestNotes = async () => {
    setIsSuggestingNotes(true);
    try {
      const res = await fetch("/api/ai/suggest-notes", {
        method: "POST",
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setNotes(data.suggestion);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggestingNotes(false);
    }
  };

  const handleGetScheduleSuggestion = async () => {
    try {
      const res = await fetch("/api/ai/scheduling-suggestion", {
        method: "POST",
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (data.suggestedTime) {
        setScheduleSuggestion({ time: data.suggestedTime, reason: data.reason });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  if (state.success) {
    return (
      <div className="sticky top-24 rounded-3xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Booking Requested!</h3>
        <p className="text-muted-foreground mb-6">
          The professional has been notified. They will review your request and get back to you shortly.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-xl shadow-brand-900/5">
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">
          {hourlyRate}
        </span>
        <span className="text-muted-foreground ml-2">/ hour</span>
      </div>

      <div className="space-y-4 mb-6 text-sm">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Fast Response</p>
            <p className="text-muted-foreground">Usually replies within 2 hours</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarDays className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Flexible Scheduling</p>
            <p className="text-muted-foreground">Weekends and evenings available</p>
          </div>
        </div>
      </div>

      <div className="my-6 border-t border-border/50" />

      {state.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Booking Failed</p>
            <p className="opacity-90">{state.error}</p>
            {state.error.includes("signed in") && (
              <Link
                href="/handler/sign-in"
                className="mt-2 text-xs font-semibold underline underline-offset-2 hover:text-red-800 dark:hover:text-red-300 inline-block"
              >
                Sign In now
              </Link>
            )}
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="serviceId" value={serviceId} />
        {location && (
          <>
            <input type="hidden" name="locationLat" value={location.lat} />
            <input type="hidden" name="locationLng" value={location.lng} />
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Your Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultPhone}
            placeholder="+251 9XX XXX XXXX"
            required
            className={state.fieldErrors?.phone ? "border-red-500" : ""}
          />
          {state.fieldErrors?.phone && (
            <p className="text-xs text-red-500">
              {state.fieldErrors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scheduledDate">When do you need them? *</Label>
            <button
              type="button"
              onClick={handleGetScheduleSuggestion}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Wand2 className="h-3 w-3" />
              Not sure when?
            </button>
          </div>
          <Input
            id="scheduledDate"
            name="scheduledDate"
            type="datetime-local"
            required
            className={state.fieldErrors?.scheduledDate ? "border-red-500" : ""}
          />
          {scheduleSuggestion && (
            <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 animate-fade-up">
              <span className="block font-medium">AI Tip: {scheduleSuggestion.time}</span>
              <span className="opacity-90">{scheduleSuggestion.reason}</span>
            </div>
          )}
          {state.fieldErrors?.scheduledDate && (
            <p className="text-xs text-red-500">
              {state.fieldErrors.scheduledDate}
            </p>
          )}
        </div>

        {/* Location Section */}
        <div className="space-y-2">
          <Label>Your Location (Auto-detect map)</Label>
          {!location ? (
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-muted-foreground border-dashed"
              onClick={handleGetLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              {isLocating ? "Locating..." : "📍 Get My Location Automatically"}
            </Button>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
              <iframe
                title="Customer Location Map"
                width="100%"
                height="150"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 shadow-md bg-background/80 backdrop-blur-sm"
                onClick={handleGetLocation}
                disabled={isLocating}
              >
                {isLocating ? "Updating..." : "Update Location"}
              </Button>
            </div>
          )}
          {locationError && (
            <p className="text-xs text-red-500">{locationError}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notes">Project Details (Optional)</Label>
            <button
              type="button"
              onClick={handleSuggestNotes}
              disabled={isSuggestingNotes}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              {isSuggestingNotes ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              ✨ Help me describe
            </button>
          </div>
          <Textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what needs to be done..."
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full text-lg py-6 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            "Request to Book"
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-4">
        You won't be charged until the provider accepts your request.
      </p>
    </div>
  );
}
