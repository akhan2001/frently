import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Agent Dashboard — Frently" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
