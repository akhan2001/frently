import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "New Listing — Frently" },
};

export default function NewListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
