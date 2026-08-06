"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface NoteFormProps {
  customerId: string;
  onNoteAdded?: () => void;
}

export default function NoteForm({ customerId, onNoteAdded }: NoteFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          userId: (session?.user as any)?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to add note");
        return;
      }

      setContent("");
      onNoteAdded?.();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg border border-amber-200 p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter une note (ex: client préfère les livraisons le matin)..."
        className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        rows={3}
        required
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
      >
        {loading ? "Ajout en cours..." : "Ajouter la note"}
      </button>
    </form>
  );
}
