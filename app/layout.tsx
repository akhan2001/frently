import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Environment sanity check — runs once per server process when this module
// is first loaded. Never throws; missing keys degrade specific features
// rather than crashing the whole app.
//   - RESEND_API_KEY missing       → transactional emails skipped (services/email.ts logs the skip)
//   - SUPABASE_SERVICE_ROLE_KEY    → /api/admin/listings can't enrich with landlord emails
//
// Dedupe per Node process via a global flag, so multi-worker builds and HMR
// don't spam the same warning.
declare global {
  var __frentlyEnvChecked: boolean | undefined;
}
if (typeof window === "undefined" && !globalThis.__frentlyEnvChecked) {
  globalThis.__frentlyEnvChecked = true;
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    console.warn(
      `[frently] Missing env vars: ${missing.join(", ")}. ` +
        `Related features will degrade gracefully but won't be active.`,
    );
  }
}

const SITE_NAME = "Frently";
const SITE_DESC =
  "List your Ontario rental on MLS. Frently handles the submission through Vancor Realty so you can focus on showings.";

export const metadata: Metadata = {
  title: {
    default: "Frently — List Your Rental on MLS",
    template: "%s — Frently",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Frently — List Your Rental on MLS",
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: "Frently — List Your Rental on MLS",
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
