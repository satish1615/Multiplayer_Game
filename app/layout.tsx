import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reactor Rush · Sky Lab",
  description: "Race your friends for energy in Sky Lab. A free multiplayer arena game for 2–6 players, with room codes, six characters and solo bot rivals.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
