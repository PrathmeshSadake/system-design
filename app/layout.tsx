import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DiagramDefs } from "@/components/diagrams/primitives";
import { Logo } from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Little Builders: System Design Made Simple",
    template: "%s | Little Builders",
  },
  description:
    "Big computer system ideas explained with playgrounds, toys, and snacks. Twenty topics with simple pictures, from caching to payment ledgers.",
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <DiagramDefs />
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#fbfaf7]/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3 rounded-lg text-slate-900">
              <Logo className="h-9 w-9 shrink-0" />
              <span className="leading-tight">
                <span className="block text-base font-bold">Little Builders</span>
                <span className="block text-xs text-slate-600">System design made simple</span>
              </span>
            </Link>
            <nav aria-label="Main">
              <Link
                href="/#topics"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50"
              >
                All topics
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <footer className="mt-20 border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 sm:px-6">
            <p>Little Builders explains how big computer systems work, using small words and everyday pictures.</p>
            <p className="mt-2">Every page is built ahead of time, so it loads fast and works without a server.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
