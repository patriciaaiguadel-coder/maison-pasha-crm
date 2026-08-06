"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import OrderStatusForm from "@/components/OrderStatusForm";
import EmailNotificationButtons from "@/components/EmailNotificationButtons";

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
  paymentStatus: string;
  supplierStatus: string;
  notifiedSupplier: boolean;
  notes: string | null;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  };
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Fetch full order details (need to create this endpoint)
        const response = await fetch(`/api/orders?limit=100`);
        const data = await response.json();

        if (data.success) {
          const foundOrder = data.data.find((o: any) => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!order) {
    return <div className="text-center py-8 text-gray-600">Commande non trouvée</div>;
  }

  const totalTTC = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/orders" className="text-amber-600 hover:underline">
            ← Retour aux commandes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Commande {order.orderNumber}
          </h1>
          <p className="text-gray-600">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">👤 Informations Client</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nom</p>
            <p className="font-medium">
              {order.customer.firstName} {order.customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-medium">{order.customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Téléphone</p>
            <p className="font-medium">{order.customer.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Adresse</p>
            <p className="font-medium">
              {order.customer.address}, {order.customer.city}{" "}
              {order.customer.postalCode}
            </p>
          </div>
          <Link
            href={`/dashboard/customers/${order.customer.id}`}
            className="text-amber-600 hover:text-amber-900 font-medium col-span-2"
          >
            → Voir le profil client
          </Link>
        </div>
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">STATUT COMMANDE</h3>
          <p className="text-2xl font-bold text-gray-900">{order.status}</p>
          <p className="text-sm text-gray-600 mt-2">
            Paiement: <span className="font-medium">{order.paymentStatus}</span>
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-sm font-semibold text-orange-900 mb-3">STATUT FOURNISSEUR</h3>
          <p className="text-2xl font-bold text-orange-900">{order.supplierStatus}</p>
          {order.notifiedSupplier && (
            <p className="text-sm text-orange-700 mt-2">✓ Fournisseur notifié</p>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            📦 Articles Commandés ({order.items.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Produit
                </th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                  Quantité
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                  Prix Unitaire
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {item.price.toFixed(2)} AED
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} AED
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                  Total TTC :
                </td>
                <td className="px-6 py-4 text-right text-2xl font-bold text-amber-900">
                  {totalTTC.toFixed(2)} {order.currency}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📌 NOTES</h3>
          <p className="text-blue-900">{order.notes}</p>
        </div>
      )}

      {/* Email Notifications */}
      <EmailNotificationButtons
        orderId={orderId}
        notifiedSupplier={order.notifiedSupplier}
      />

      {/* Update Status Form */}
      <OrderStatusForm
        orderId={orderId}
        initialStatus={order.status}
        initialSupplierStatus={order.supplierStatus}
        onUpdated={() => {
          // Refresh order data
          window.location.reload();
        }}
      />
    </div>
  );
}
