"use client";

import { useState, useEffect } from "react";

interface LoyaltyStats {
  currentPoints: number;
  expectedPoints: number;
  pointsDifference: number;
  totalSpent: number;
  averageOrderValue: number;
  nextTierAt: number;
}

interface LoyaltyPointsManagerProps {
  customerId: string;
  currentPoints: number;
  totalSpent: number;
}

export default function LoyaltyPointsManager({
  customerId,
  currentPoints,
  totalSpent,
}: LoyaltyPointsManagerProps) {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pointsAmount, setPointsAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [customerId]);

  async function fetchStats() {
    try {
      const response = await fetch(`/api/customers/${customerId}/loyalty`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }

  async function addPoints(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amount = parseInt(pointsAmount);
    if (!amount || amount === 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/customers/${customerId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erreur");
        return;
      }

      setSuccess(`✓ ${Math.abs(amount)} points ${amount > 0 ? "ajoutés" : "retirés"}`);
      setPointsAmount("");
      setReason("");
      fetchStats();
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function recalculate() {
    if (!confirm("Recalculer les points basé sur les dépenses?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/loyalty`, {
        method: "PUT",
      });

      if (!response.ok) {
        setError("Erreur lors du recalcul");
        return;
      }

      setSuccess("✓ Points recalculés");
      fetchStats();
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
          <p className="text-sm text-amber-700 font-semibold mb-2">POINTS ACTUELS</p>
          <p className="text-4xl font-bold text-amber-900">{stats?.currentPoints || currentPoints}</p>
          <p className="text-xs text-amber-600 mt-2">
            Dépensés: {stats?.totalSpent.toFixed(2) || totalSpent.toFixed(2)} AED
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-sm text-blue-700 font-semibold mb-2">PROGRESSION</p>
          <div className="relative">
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    ((stats?.currentPoints || currentPoints) / 1000) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {Math.max(0, (stats?.nextTierAt || 1000) - (stats?.currentPoints || currentPoints))} points
              avant le prochain palier
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <p className="text-sm text-green-700 font-semibold mb-2">STATISTIQUES</p>
          <p className="text-sm text-green-900">
            <strong>Cmd moyenne:</strong> {stats?.averageOrderValue.toFixed(2) || "0"} AED
          </p>
          <p className="text-sm text-green-900 mt-1">
            <strong>Points/AED:</strong> 1 point
          </p>
        </div>
      </div>

      {/* Add/Subtract Points */}
      <form onSubmit={addPoints} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter/Retirer des Points</h3>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant de Points
            </label>
            <input
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="ex: 50 ou -20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Positif pour ajouter, négatif pour retirer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: Parrainage, Retour"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {loading ? "Mise à jour..." : "Appliquer"}
          </button>

          <button
            type="button"
            onClick={recalculate}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-medium rounded-lg transition"
          >
            🔄 Recalculer
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Système de Fidélité:</strong>
        </p>
        <ul className="text-sm text-blue-900 mt-2 list-disc list-inside space-y-1">
          <li>1 point par AED dépensé</li>
          <li>Points cumulés automatiquement avec chaque commande</li>
          <li>Palier suivant à 1000 points</li>
          <li>Peut être ajusté manuellement avec raison</li>
        </ul>
      </div>
    </div>
  );
}
