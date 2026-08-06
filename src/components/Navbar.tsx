"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", adminOnly: false },
    { href: "/dashboard/customers", label: "Clients", adminOnly: false },
    { href: "/dashboard/orders", label: "Commandes", adminOnly: false },
    { href: "/dashboard/orders-live", label: "📊 Live", adminOnly: true },
    { href: "/dashboard/sourcing", label: "🤖 Agent", adminOnly: true },
    { href: "/dashboard/loyalty", label: "Fidélité", adminOnly: true },
    { href: "/dashboard/settings", label: "Paramètres", adminOnly: true },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.adminOnly || (session?.user as any)?.role === "ADMIN"
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-amber-900">
              🏠 Maison Pasha
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-amber-100 text-amber-900"
                    : "text-gray-700 hover:text-amber-900 hover:bg-amber-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="text-gray-900 font-medium">{session?.user?.name}</p>
              <p className="text-gray-500 text-xs">
                {(session?.user as any)?.role === "ADMIN" ? "Administrateur" : "Fournisseur"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
