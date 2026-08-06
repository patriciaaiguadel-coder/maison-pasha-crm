"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [customersRes, ordersRes, pendingRes] = await Promise.all([
          fetch("/api/customers?limit=1"),
          fetch("/api/orders?limit=1"),
          fetch("/api/orders?status=PENDING&limit=100"),
        ]);

        const customersData = await customersRes.json();
        const ordersData = await ordersRes.json();
        const pendingData = await pendingRes.json();

        if (customersData.success && ordersData.success) {
          const totalRevenue = ordersData.data?.reduce(
            (sum: number, order: any) => sum + (order.totalAmount || 0),
            0
          ) || 0;

          setStats({
            totalCustomers: customersData.pagination?.total || 0,
            totalOrders: ordersData.pagination?.total || 0,
            pendingOrders: pendingData.pagination?.total || 0,
            totalRevenue,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalCustomers,
      icon: "👥",
      link: "/dashboard/customers",
    },
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: "📦",
      link: "/dashboard/orders",
    },
    {
      title: "Commandes en Attente",
      value: stats.pendingOrders,
      icon: "⏳",
      link: "/dashboard/orders?status=PENDING",
      highlight: true,
    },
    {
      title: "Revenue Total",
      value: `${stats.totalRevenue.toFixed(2)} AED`,
      icon: "💰",
      link: "/dashboard/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenue, {session?.user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {(session?.user as any)?.role === "ADMIN"
            ? "Gérez vos clients, commandes et paramètres depuis ce tableau de bord."
            : "Consultez les commandes à préparer et à expédier."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`block p-6 rounded-lg border-2 transition transform hover:scale-105 ${
              card.highlight
                ? "border-amber-300 bg-amber-50"
                : "border-gray-200 bg-white hover:border-amber-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : card.value}
                </p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accès Rapide</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/customers"
              className="block p-3 text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              ➜ Voir tous les clients
            </Link>
            <Link
              href="/dashboard/orders"
              className="block p-3 text-amber-600 hover:bg-amber-50 rounded-lg transition"
            >
              ➜ Voir toutes les commandes
            </Link>
            {(session?.user as any)?.role === "ADMIN" && (
              <>
                <Link
                  href="/dashboard/settings"
                  className="block p-3 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                >
                  ⚙️ Paramètres
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">À Propos</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Rôle :</strong>{" "}
              {(session?.user as any)?.role === "ADMIN" ? "Administrateur" : "Fournisseur"}
            </p>
            <p>
              <strong>Email :</strong> {session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Maison Pasha CRM v0.1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
