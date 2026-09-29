import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Split Signal · Restore the connection",
  description: "A cooperative signal-repair game for 2–6 players. Share clues, connect the relays, and send the rescue signal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
