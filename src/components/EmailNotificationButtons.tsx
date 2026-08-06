"use client";

import { useState } from "react";

interface EmailNotificationButtonsProps {
  orderId: string;
  notifiedSupplier?: boolean;
}

export default function EmailNotificationButtons({
  orderId,
  notifiedSupplier = false,
}: EmailNotificationButtonsProps) {
  const [loading, setLoading] = useState<"supplier" | "customer" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function sendEmail(type: "supplier" | "customer") {
    setError(null);
    setSuccess(null);
    setLoading(type);

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to send email");
        return;
      }

      setSuccess(
        type === "supplier"
          ? "Email envoyé au fournisseur ✓"
          : "Email envoyé au client ✓"
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📧 Notifications Email</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => sendEmail("supplier")}
          disabled={loading !== null}
          className={`w-full px-4 py-3 rounded-lg font-medium transition ${
            notifiedSupplier
              ? "bg-green-100 text-green-900 border border-green-300"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          } disabled:opacity-50`}
        >
          {loading === "supplier" ? "Envoi en cours..." : "📬 Envoyer au Fournisseur"}
          {notifiedSupplier && " ✓ (déjà notifié)"}
        </button>

        <button
          onClick={() => sendEmail("customer")}
          disabled={loading !== null}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {loading === "customer" ? "Envoi en cours..." : "📬 Envoyer au Client"}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Note:</strong> Les emails sont envoyés automatiquement lors de la
          création de la commande. Utilisez ces boutons pour renvoyer les emails si
          nécessaire.
        </p>
      </div>
    </div>
  );
}
