"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  supplierStatus: string;
  notifiedSupplier: boolean;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState(statusFilter || "");

  const limit = 20;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        let url = `/api/orders?page=${page}&limit=${limit}`;
        if (filter) {
          url += `&status=${filter}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setOrders(data.data);
          setTotal(data.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, filter]);

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-900",
    CONFIRMED: "bg-blue-100 text-blue-900",
    SHIPPED: "bg-purple-100 text-purple-900",
    DELIVERED: "bg-green-100 text-green-900",
    CANCELLED: "bg-red-100 text-red-900",
  };

  const supplierStatusColors: Record<string, string> = {
    PENDING: "bg-orange-100 text-orange-900",
    PREPARING: "bg-blue-100 text-blue-900",
    READY: "bg-green-100 text-green-900",
    SHIPPED: "bg-purple-100 text-purple-900",
    DELIVERED: "bg-green-100 text-green-900",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-600 mt-1">
          Total : {total} commande{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilter("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === ""
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Toutes
          </button>
          {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-amber-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune commande trouvée
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                      Commande
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                      Client
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                      Montant
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                      Fournisseur
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {order.totalAmount.toFixed(2)} {order.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              supplierStatusColors[order.supplierStatus] ||
                              "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {order.supplierStatus}
                          </span>
                          {order.notifiedSupplier && (
                            <span className="text-xs text-gray-500">
                              ✓ Notifiée
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="text-amber-600 hover:text-amber-900 font-medium"
                          >
                            Détails
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/dashboard/customers/${order.customer.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Client
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
export default function OrdersPage() { return (<Suspense fallback={<div>Loading...</div>}><OrdersPageContent /></Suspense>); }
