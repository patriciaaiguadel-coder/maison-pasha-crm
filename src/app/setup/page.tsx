'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setupUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🏠 Maison Pasha Setup</h1>
        <p className="text-gray-600 mb-6">Initialize admin and supplier users</p>

        <button
          onClick={setupUsers}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading ? '⏳ Setting up...' : '⚙️ Setup Users'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`font-semibold mb-2 ${result.error ? 'text-red-800' : 'text-green-800'}`}>
              {result.error ? '❌ Error' : '✅ Success'}
            </p>
            <pre className="text-xs overflow-auto max-h-64 text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {result && result.credentials && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">📝 Your Credentials:</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-blue-600 font-semibold">Admin:</p>
                <p className="text-gray-700">{result.credentials.admin}</p>
              </div>
              <div>
                <p className="text-blue-600 font-semibold">Supplier:</p>
                <p className="text-gray-700">{result.credentials.supplier}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
