import type { Metadata } from "next";

// app/dashboard/page.tsx is a client component, which can't export metadata.
// This sibling server layout sets the per-route title instead.
export const metadata: Metadata = {
  title: { absolute: "My Listings — Frently" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
