"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/customers?page=${page}&limit=${limit}&search=${search}`
        );
        const data = await response.json();

        if (data.success) {
          setCustomers(data.data);
          setTotal(data.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">
          Total : {total} client{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Rechercher par email, prénom ou nom..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun client trouvé
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Nom
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Téléphone
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Total Dépensé
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Points
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-gray-900">
                      {customer.totalSpent.toFixed(2)} AED
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold">
                        {customer.loyaltyPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="text-amber-600 hover:text-amber-900 font-medium"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition"
                >
                  ← Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
