import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GMGN Dashboard — Meme Coin Scanner",
  description: "Real-time Solana meme coin analytics powered by DexScreener",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
