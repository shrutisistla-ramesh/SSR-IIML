import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskflow — Your work, in motion",
  description: "A calm, simple workspace to plan tasks, set timelines, and track progress."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
