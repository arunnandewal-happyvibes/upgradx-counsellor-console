import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { SessionRecorderWidget } from "@/components/console/SessionRecorderWidget";
import { VoiceAssistant } from "@/components/console/VoiceAssistant";

export const metadata: Metadata = {
  title: "Expert Counselling Portal by upGrad X",
  description: "The Expert Counselling Portal by upGrad X — internal counselling tool for upGrad X call sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        {/* Inter for body copy, Inter Tight for headlines and big numbers. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-on-background">
        <ToastProvider>
          {children}
          <SessionRecorderWidget />
          <VoiceAssistant />
        </ToastProvider>
      </body>
    </html>
  );
}
