"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if not admin
  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-900">
        <h2 className="text-lg font-bold mb-2">Accès Refusé</h2>
        <p>Vous n'avez pas les permissions pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez les configurations du CRM</p>
      </div>

      {/* Webhooks Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 Webhooks Shopify</h2>
        <p className="text-gray-600 mb-4">
          Synchronisez votre boutique Shopify avec le CRM en temps réel.
        </p>

        <div className="space-y-3">
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/webhooks/register", {
                  method: "POST",
                });
                const data = await response.json();
                alert(
                  data.success
                    ? "Webhooks enregistrés avec succès!"
                    : "Erreur lors de l'enregistrement des webhooks"
                );
              } catch (error) {
                alert("Erreur: " + error);
              }
            }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            📝 Enregistrer les Webhooks
          </button>

          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/webhooks/register");
                const data = await response.json();
                console.log("Webhooks enregistrés:", data.data);
                alert(
                  "Consultez la console pour voir les webhooks enregistrés"
                );
              } catch (error) {
                alert("Erreur: " + error);
              }
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            🔍 Voir les Webhooks
          </button>
        </div>
      </div>

      {/* Initial Sync */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔄 Synchronisation</h2>
        <p className="text-gray-600 mb-4">
          Importez tous vos clients et commandes Shopify actuels dans le CRM.
        </p>

        <button
          onClick={async () => {
            if (
              !confirm(
                "Cela importera tous vos clients et commandes Shopify. Continuer?"
              )
            ) {
              return;
            }

            try {
              const response = await fetch("/api/shopify/sync", {
                method: "POST",
              });
              const data = await response.json();

              if (data.success) {
                alert(
                  `Synchronisation réussie!\n\nClients: ${data.data.customers}\nCommandes: ${data.data.orders}`
                );
              } else {
                alert("Erreur: " + data.error);
              }
            } catch (error) {
              alert("Erreur: " + error);
            }
          }}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          🚀 Synchroniser Maintenant
        </button>
      </div>

      {/* API Documentation */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">📚 Documentation API</h2>
        <div className="space-y-3 text-sm text-blue-900">
          <p>
            <strong>Base URL :</strong> {process.env.NEXTAUTH_URL || "http://localhost:3000"}
          </p>

          <div>
            <p className="font-medium">Endpoints disponibles :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <code className="bg-blue-100 px-2 py-1 rounded">
                  GET /api/customers
                </code>
              </li>
              <li>
                <code className="bg-blue-100 px-2 py-1 rounded">
                  GET /api/orders
                </code>
              </li>
              <li>
                <code className="bg-blue-100 px-2 py-1 rounded">
                  GET /api/webhooks/logs
                </code>
              </li>
              <li>
                <code className="bg-blue-100 px-2 py-1 rounded">
                  POST /api/webhooks/shopify
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">ℹ️ À Propos</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Maison Pasha CRM</strong> v0.1.0
          </p>
          <p>Système de gestion de relation client pour boutiques Shopify</p>
          <p className="mt-3 text-xs">
            Développé avec Next.js, Prisma, PostgreSQL et NextAuth.js
          </p>
        </div>
      </div>
    </div>
  );
}
