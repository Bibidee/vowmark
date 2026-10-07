import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletBar } from "@/components/WalletBar";

export const metadata: Metadata = {
  title: "VOWMARK — public commitments with a memory",
  description: "A public commitment bond with frozen evidence and GenLayer review.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="wordmark" href="/" aria-label="VOWMARK home">
            <span className="wordmark-mark">V</span>
            <span>VOWMARK</span>
          </Link>
          <nav className="nav-links" aria-label="Primary navigation">
            <Link href="/">Maturity Board</Link>
            <Link href="/issue">Make a commitment</Link>
            <Link href="/activity">Activity</Link>
          </nav>
          <WalletBar />
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>VOWMARK / Studionet 61999</span>
          <span>Public commitments. Frozen terms. No private adjudicator.</span>
        </footer>
      </body>
    </html>
  );
}
