import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "GMGN Trenches — Real-time Solana Meme Coin Scanner",
  description: "Live on-chain meme coin tracking on Solana. New, bonding, and migrated tokens with real-time price, MC, holders, and social data.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-hidden h-screen">{children}</body>
    </html>
  );
}
