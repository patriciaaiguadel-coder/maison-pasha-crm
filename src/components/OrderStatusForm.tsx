"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface OrderStatusFormProps {
  orderId: string;
  initialStatus: string;
  initialSupplierStatus: string;
  onUpdated?: () => void;
}

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const SUPPLIER_STATUSES = ["PENDING", "PREPARING", "READY", "SHIPPED", "DELIVERED"];

export default function OrderStatusForm({
  orderId,
  initialStatus,
  initialSupplierStatus,
  onUpdated,
}: OrderStatusFormProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus);
  const [supplierStatus, setSupplierStatus] = useState(initialSupplierStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSupplier = (session?.user as any)?.role === "SUPPLIER";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: isSupplier ? undefined : status,
          supplierStatus: supplierStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update order");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onUpdated?.();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Mettre à Jour le Statut</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✓ Statut mis à jour avec succès
        </div>
      )}

      <div className="space-y-4">
        {!isSupplier && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut de Commande
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="supplierStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Statut Fournisseur
          </label>
          <select
            id="supplierStatus"
            value={supplierStatus}
            onChange={(e) => setSupplierStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {SUPPLIER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isSupplier && (
            <p className="text-sm text-gray-500 mt-2">
              En tant que fournisseur, vous pouvez mettre à jour le statut de préparation.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
}
