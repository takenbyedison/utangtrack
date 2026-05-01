import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "UtangTrack",
  description: "Private peer-to-peer loan tracking for lenders and borrowers."
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/borrowers/new", label: "Borrower" },
  { href: "/loans/new", label: "Loan" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-ink/10 bg-paper">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-bay">
              UtangTrack
            </Link>
            <div className="flex items-center gap-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded px-2 py-1 text-ink/75 hover:bg-bay/10 hover:text-bay"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto min-h-[calc(100vh-57px)] max-w-5xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
