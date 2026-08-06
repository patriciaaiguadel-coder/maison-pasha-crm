"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NoteForm from "@/components/NoteForm";
import CustomerEditForm from "@/components/CustomerEditForm";
import LoyaltyPointsManager from "@/components/LoyaltyPointsManager";

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
  createdAt: string;
  items: OrderItem[];
}

interface Note {
  id: string;
  content: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  createdAt: string;
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  orders: Order[];
  notes: Note[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  const { data: session } = useSession();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await fetch(`/api/customers/${customerId}`);
        const data = await response.json();

        if (data.success) {
          setCustomer(data.data);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-gray-600">Client non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/customers" className="text-amber-600 hover:underline">
            ← Retour aux clients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-gray-600">{customer.email}</p>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">
            INFORMATIONS PERSONNELLES
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Téléphone</p>
              <p className="font-medium">{customer.phone || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Adresse</p>
              <p className="font-medium">{customer.address || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Ville</p>
              <p className="font-medium">{customer.city || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Code Postal</p>
              <p className="font-medium">{customer.postalCode || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Pays</p>
              <p className="font-medium">{customer.country || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">
            STATISTIQUES
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Total Dépensé</p>
              <p className="text-3xl font-bold text-amber-900">
                {customer.totalSpent.toFixed(2)}
                <span className="text-lg text-gray-600"> AED</span>
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Nombre de Commandes</p>
              <p className="text-3xl font-bold text-gray-900">
                {customer.orders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
          <h3 className="text-sm font-semibold text-amber-900 mb-4">
            🎁 POINTS DE FIDÉLITÉ
          </h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-900">
              {customer.loyaltyPoints}
            </p>
            <p className="text-amber-700 text-sm mt-2">
              Points accumulés
            </p>
            <div className="mt-4 bg-amber-200 rounded-full h-2 w-full">
              <div
                className="bg-amber-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    (customer.loyaltyPoints / 1000) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            📦 Commandes ({customer.orders.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {customer.orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune commande
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Commande
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Articles
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Montant
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} article
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {order.totalAmount.toFixed(2)} AED
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Form (Admin Only) */}
      {(session?.user as any)?.role === "ADMIN" && (
        <>
          <CustomerEditForm
            customerId={customerId}
            initialData={{
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              postalCode: customer.postalCode,
              country: customer.country,
            }}
            onSaved={() => {
              // Refresh customer data
              window.location.reload();
            }}
          />

          {/* Loyalty Points Manager (Admin Only) */}
          <LoyaltyPointsManager
            customerId={customerId}
            currentPoints={customer.loyaltyPoints}
            totalSpent={customer.totalSpent}
          />
        </>
      )}

      {/* Notes Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📝 Notes CRM ({customer.notes.length})
          </h2>
        </div>

        {/* Add Note Form */}
        <NoteForm
          customerId={customerId}
          onNoteAdded={() => {
            // Refresh customer data
            window.location.reload();
          }}
        />

        {/* Notes List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {customer.notes.length === 0 ? (
            <p className="text-gray-500">Aucune note</p>
          ) : (
            <div className="space-y-4">
              {customer.notes.map((note) => (
                <div key={note.id} className="border-l-4 border-amber-300 pl-4 py-2">
                  <p className="text-sm text-gray-900">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    par {note.user.name || note.user.email} •{" "}
                    {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
