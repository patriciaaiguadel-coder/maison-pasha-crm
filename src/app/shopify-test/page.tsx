'use client';

import { useState } from 'react';

export default function ShopifyTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopify/test');
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
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Shopify Connection</h1>
        <p className="text-gray-600 mb-6">Test if the CRM can connect to your Shopify store</p>

        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition mb-6"
        >
          {loading ? '⏳ Testing...' : '🔗 Test Connection'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-bold mb-3 text-lg ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Success!' : '❌ Error'}
            </p>

            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success && result.shop && (
              <div className="mt-4 p-4 bg-blue-100 rounded border border-blue-300">
                <p className="font-semibold text-blue-900 mb-2">📊 Your Store:</p>
                <p className="text-blue-800">
                  <strong>Name:</strong> {result.shop.name}
                </p>
                <p className="text-blue-800">
                  <strong>Email:</strong> {result.shop.email}
                </p>
                <p className="text-blue-800 mt-3 text-sm">
                  ✅ Ready to synchronize! Go back to Settings and click "Synchroniser Maintenant"
                </p>
              </div>
            )}

            {result.error && (
              <div className="mt-4 p-4 bg-yellow-100 rounded border border-yellow-300">
                <p className="text-yellow-900 text-sm">
                  <strong>Need help?</strong> The credentials might be expired.
                  Check your Shopify Admin for new API credentials and update the .env.local file.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
