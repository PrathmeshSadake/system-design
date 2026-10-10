import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Little Builders: system design, explained small",
    template: "%s · Little Builders",
  },
  description:
    "System design and low level design, told with playgrounds, toys and snacks, and drawn as line figures that answer your pointer.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to the lesson
        </a>
        <header className="topbar">
          <Link href="/" className="topbar-name">
            Little Builders <span className="topbar-sub">system design, explained small</span>
          </Link>
          <nav aria-label="Main">
            <Link className="topbar-link" href="/#lessons">
              Lessons
            </Link>
            <Link className="topbar-link" href="/#stories">
              Stories
            </Link>
            <Link className="topbar-link" href="/#lld">
              LLD
            </Link>
          </nav>
        </header>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <footer className="footer">
          <p>
            Little Builders explains how big computer systems work, in small words. Every drawing is a{" "}
            <a href="https://hairline.lucasmarkes.com/" rel="noreferrer">
              Hairline
            </a>{" "}
            figure: move your pointer over it, or press play.
          </p>
        </footer>
      </body>
    </html>
  );
}
