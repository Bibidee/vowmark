import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { WalletBar } from "@/components/WalletBar";

export const metadata: Metadata = {
  title: "VOWMARK — Neon Oath Machine",
  description: "A public commitment protocol for frozen terms, evidence, and GenLayer review.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="header-brand">
            <Link className="wordmark" href="/" aria-label="VOWMARK home">
              <span className="wordmark-mark">V</span>
              <span>VOWMARK</span>
            </Link>
            <span className="brand-sub">NEON OATH MACHINE / PUBLIC RECORD</span>
          </div>
          <div className="protocol-rail" aria-hidden="true"><span>PUBLIC COMMITMENT PROTOCOL</span><span>GENLAYER</span></div>
          <div className="header-meta"><span className="network-tag">STUDIONET / 61999</span><WalletBar /></div>
          <nav className="nav-links" aria-label="Primary navigation">
            <Link href="/"><span className="nav-index">01</span>MATURITY BOARD</Link>
            <Link href="/issue"><span className="nav-index">02</span>MAKE A VOW</Link>
            <Link href="/activity"><span className="nav-index">03</span>ACTIVITY TRACE</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>VOWMARK // STUDIONET 61999 // GENLAYER</span>
          <span>PUBLIC COMMITMENTS / FROZEN TERMS / NO PRIVATE ADJUDICATOR</span>
        </footer>
      </body>
    </html>
  );
}
