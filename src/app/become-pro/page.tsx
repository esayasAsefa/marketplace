"use client";

import { useActionState, useState, useRef } from "react";
import { useUser } from "@stackframe/stack";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  User,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProProfile, type FormState } from "./actions";

const SERVICE_CATEGORIES = [
  { id: "electrician", label: "Electrician", icon: "⚡" },
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "tutor", label: "Tutor", icon: "📚" },
  { id: "developer", label: "Developer", icon: "💻" },
  { id: "painter", label: "Painter", icon: "🎨" },
  { id: "carpenter", label: "Carpenter", icon: "🪵" },
  { id: "it-support", label: "IT Support", icon: "🖥️" },
  { id: "mover", label: "Mover", icon: "🚚" },
  { id: "barber", label: "Barber", icon: "✂️" },
  { id: "photographer", label: "Photographer", icon: "📷" },
  { id: "gardener", label: "Gardener", icon: "🌿" },
  { id: "security", label: "Security", icon: "🛡️" },
];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Reach thousands of customers looking for your services",
  },
  {
    icon: Shield,
    title: "Verified Badge",
    description: "Stand out with a trusted professional verification",
  },
  {
    icon: DollarSign,
    title: "Set Your Rates",
    description: "You decide how much to charge for your expertise",
  },
];

const steps = [
  { label: "Profile", icon: User },
  { label: "Service", icon: Briefcase },
];

export default function BecomeProPage() {
  const user = useUser();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createProProfile,
    { success: false }
  );

  // Redirect to sign in if not authenticated
  if (!user) {
    redirect("/handler/sign-in");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image must be less than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
              <Sparkles className="h-4 w-4" />
              Join our Pro Network
            </div>

            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Become a{" "}
              <span className="gradient-text">Professional</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Set up your profile, showcase your services, and start connecting
              with customers in your area today.
            </p>

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 text-left backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative mx-auto max-w-3xl px-4 -mt-8 pb-20 sm:px-6">
        {/* Step Indicators */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                step === i
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : step > i
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > i ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              {s.label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {state.error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 animate-fade-up">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          {/* Hidden category field */}
          <input type="hidden" name="categoryId" value={selectedCategory} />

          {/* ===== STEP 1: PROFILE ===== */}
          <div
            className={`transition-all duration-500 ${
              step === 0
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute pointer-events-none"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5">
              <div className="border-b border-border/50 bg-gradient-to-r from-brand-50 to-purple-50 px-6 py-4 dark:from-brand-950/30 dark:to-purple-950/30">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <User className="h-5 w-5 text-brand-500" />
                  Your Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell customers about yourself
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-brand-100 shadow-lg transition-all hover:border-brand-300 dark:border-brand-900 dark:hover:border-brand-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview || user.profileImageUrl ? (
                      <img
                        src={imagePreview || user.profileImageUrl || ""}
                        alt="Profile"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800">
                        <User className="h-10 w-10 text-brand-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Photo
                  </button>
                  {state.fieldErrors?.profileImage && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.profileImage}
                    </p>
                  )}
                </div>

                {/* Display Name (read-only from StackAuth) */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={user.displayName || user.primaryEmail || ""}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your StackAuth display name. Update it in your account
                    settings.
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+251 9XX XXX XXXX"
                    required
                  />
                  {state.fieldErrors?.phone && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    About You *
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Tell customers about your experience, skills, and what makes you stand out..."
                    required
                    className="resize-none"
                  />
                  {state.fieldErrors?.bio && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.bio}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 text-white shadow-md shadow-brand-500/25 transition-all hover:scale-105 hover:shadow-brand-500/40"
                  >
                    Next: Service Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== STEP 2: SERVICE ===== */}
          <div
            className={`transition-all duration-500 ${
              step === 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute pointer-events-none"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5">
              <div className="border-b border-border/50 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 dark:from-emerald-950/30 dark:to-teal-950/30">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  Your Service
                </h2>
                <p className="text-sm text-muted-foreground">
                  Describe what you offer to customers
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* Service Category */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    Service Category *
                  </Label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all duration-200 ${
                          selectedCategory === cat.id
                            ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/10 dark:bg-brand-950/30 dark:text-brand-300"
                            : "border-border/50 hover:border-brand-200 hover:bg-brand-50/50 dark:hover:border-brand-800"
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  {state.fieldErrors?.categoryId && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* Service Title */}
                <div className="space-y-2">
                  <Label htmlFor="serviceTitle" className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Service Title *
                  </Label>
                  <Input
                    id="serviceTitle"
                    name="serviceTitle"
                    placeholder="e.g. Expert Home Wiring & Electrical Repairs"
                    required
                  />
                  {state.fieldErrors?.serviceTitle && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.serviceTitle}
                    </p>
                  )}
                </div>

                {/* Service Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="serviceDescription"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Service Description *
                  </Label>
                  <Textarea
                    id="serviceDescription"
                    name="serviceDescription"
                    rows={4}
                    placeholder="Describe what your service includes, your experience, tools you use, turnaround time, etc."
                    required
                    className="resize-none"
                  />
                  {state.fieldErrors?.serviceDescription && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.serviceDescription}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Starting Price (ETB) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      ETB
                    </span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="500"
                      required
                      className="pl-12"
                    />
                  </div>
                  {state.fieldErrors?.price && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.price}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Service Area / Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g. Bole, Addis Ababa"
                    required
                  />
                  {state.fieldErrors?.address && (
                    <p className="text-sm text-red-500">
                      {state.fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-white shadow-lg shadow-brand-500/25 transition-all hover:scale-105 hover:shadow-brand-500/40 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Launch My Pro Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
