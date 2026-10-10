import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicFix — Neighbourhood issues, in one place",
  description:
    "A CivicFix demo for browsing neighbourhood reports and understanding how community issue tracking could work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
