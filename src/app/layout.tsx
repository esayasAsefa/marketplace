import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { AiChatbot } from "@/components/ai-chatbot";
import { syncCurrentUser } from "@/lib/sync-user";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProNear — Find Trusted Local Professionals Near You",
  description:
    "Connect with top-rated electricians, plumbers, tutors, and freelance developers in your area. Book trusted local professionals with verified reviews.",
  keywords: [
    "local services",
    "electrician",
    "plumber",
    "tutor",
    "freelance developer",
    "home services",
    "local professionals",
    "booking",
  ],
  openGraph: {
    title: "ProNear — Find Trusted Local Professionals Near You",
    description:
      "Connect with top-rated electricians, plumbers, tutors, and freelance developers in your area.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync user to DB — fire-and-forget, never crash the layout
  try {
    await syncCurrentUser();
  } catch {
    // StackAuth or DB unreachable — continue rendering the page
  }

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <StackProvider app={stackServerApp}>
          <TooltipProvider>
            <Suspense>{children}</Suspense>
            <AiChatbot />
          </TooltipProvider>
        </StackProvider>
      </body>
    </html>
  );
}
