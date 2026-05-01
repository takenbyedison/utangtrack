import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Banknote,
  CreditCard,
  LayoutDashboard,
  Settings,
  Users
} from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "UtangTrack",
  description: "A calm way to track utang between people who know each other."
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrowers", label: "People", icon: Users },
  { href: "/loans", label: "Records", icon: Banknote },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="min-h-screen lg:flex">
          <aside className="border-b border-ink/10 bg-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col px-4 py-4">
              <Link href="/" className="text-xl font-bold text-bay">
                UtangTrack
              </Link>
              <p className="mt-1 text-xs text-ink/60">
                Utang records for people who know each other.
              </p>
              <nav className="mt-5 grid gap-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring flex items-center gap-3 rounded px-3 py-2 font-medium text-ink/75 hover:bg-mint hover:text-moss"
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
              </nav>
              <div className="mt-5 rounded border border-bay/15 bg-mint p-3 text-xs text-moss lg:mt-auto">
                Your records stay with you. No public list, no shaming.
              </div>
            </div>
          </aside>
          <div className="flex-1 lg:pl-64">
            <header className="border-b border-ink/10 bg-paper/80 px-4 py-3 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">Keep things clear</p>
                <Link
                  className="focus-ring rounded border border-ink/15 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-white"
                  href="/loans/new"
                >
                  Add record
                </Link>
              </div>
            </header>
            <main className="min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
