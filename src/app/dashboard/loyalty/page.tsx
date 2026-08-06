"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoyaltyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
}

export default function LoyaltyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"points" | "spent">("points");

  // Redirect if not admin
  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-900">
        <h2 className="text-lg font-bold mb-2">Accès Refusé</h2>
        <p>Seuls les administrateurs peuvent voir cette page.</p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        const response = await fetch("/api/customers?limit=500");
        const data = await response.json();

        if (data.success) {
          setCustomers(data.data);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortBy === "points") {
      return b.loyaltyPoints - a.loyaltyPoints;
    } else {
      return b.totalSpent - a.totalSpent;
    }
  });

  // Calculate stats
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averagePoints =
    customers.length > 0 ? totalPoints / customers.length : 0;
  const topCustomer = customers.length > 0
    ? customers.reduce((prev, current) =>
        prev.loyaltyPoints > current.loyaltyPoints ? prev : current
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🎁 Fidélité Client</h1>
        <p className="text-gray-600 mt-1">Gestion du programme de points de récompense</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
          <p className="text-sm text-amber-700 font-semibold mb-2">POINTS TOTAUX</p>
          <p className="text-4xl font-bold text-amber-900">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-amber-600 mt-2">
            Moyenne: {averagePoints.toFixed(0)} par client
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-sm text-blue-700 font-semibold mb-2">REVENU TOTAL</p>
          <p className="text-4xl font-bold text-blue-900">{totalSpent.toFixed(2)}</p>
          <p className="text-xs text-blue-600 mt-2">AED dépensés au total</p>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <p className="text-sm text-green-700 font-semibold mb-2">CLIENTS ACTIFS</p>
          <p className="text-4xl font-bold text-green-900">{customers.length}</p>
          <p className="text-xs text-green-600 mt-2">
            {customers.length > 0
              ? (customers.filter((c) => c.loyaltyPoints > 0).length / customers.length * 100).toFixed(0)
              : 0}% avec points
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <p className="text-sm text-purple-700 font-semibold mb-2">CLIENT VIP</p>
          <p className="font-bold text-purple-900">
            {topCustomer?.firstName} {topCustomer?.lastName}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {topCustomer?.loyaltyPoints} points
          </p>
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-2">
        <button
          onClick={() => setSortBy("points")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            sortBy === "points"
              ? "bg-amber-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Trier par Points
        </button>
        <button
          onClick={() => setSortBy("spent")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            sortBy === "spent"
              ? "bg-amber-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Trier par Dépenses
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun client</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Points
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Dépensés
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                    Niveau
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((customer) => {
                  const level =
                    customer.loyaltyPoints >= 1000
                      ? "🏆 Gold"
                      : customer.loyaltyPoints >= 500
                      ? "🥈 Silver"
                      : customer.loyaltyPoints >= 100
                      ? "🥉 Bronze"
                      : "⭐ Standard";

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-900">
                        {customer.loyaltyPoints}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {customer.totalSpent.toFixed(2)} AED
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {level}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="text-amber-600 hover:text-amber-900 font-medium"
                        >
                          Gérer →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">📊 Niveaux de Fidélité</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold text-amber-900">⭐ Standard</p>
            <p className="text-amber-700">0-99 points</p>
          </div>
          <div>
            <p className="font-semibold text-amber-900">🥉 Bronze</p>
            <p className="text-amber-700">100-499 points</p>
          </div>
          <div>
            <p className="font-semibold text-amber-900">🥈 Silver</p>
            <p className="text-amber-700">500-999 points</p>
          </div>
          <div>
            <p className="font-semibold text-amber-900">🏆 Gold</p>
            <p className="text-amber-700">1000+ points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
