'use client';

import { useState } from 'react';

export default function ShopifySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const syncShopifyData = async () => {
    try {
      setLoading(true);
      setStatus('idle');

      const response = await fetch('/api/shopify/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(`✅ Sync completed!\n\nCustomers synced: ${data.data.customers}\nOrders synced: ${data.data.orders}`);
      } else {
        setStatus('error');
        setMessage(`❌ Error: ${data.error}\n\n${data.details}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopify/sync');
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Connection to Shopify API is working!');
      } else {
        setStatus('error');
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Connection failed: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🛍️ Shopify Integration</h1>
        <p className="text-gray-600 mb-8">Sync and configure your Shopify store connection</p>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connection Status</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">
                  <strong>Store Domain:</strong> maison-pasha.com
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Webhook URL:</strong> https://your-domain.com/api/webhooks/shopify
                </p>
              </div>

              <button
                onClick={testConnection}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {loading ? '🔄 Testing...' : '🧪 Test Connection'}
              </button>
            </div>
          </div>

          {/* Initial Sync */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Initial Sync</h2>
            <p className="text-gray-600 mb-4">
              Sync all your existing customers and orders from Shopify to the CRM.
              This is useful when setting up for the first time.
            </p>

            <button
              onClick={syncShopifyData}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? '🔄 Syncing...' : '📥 Sync All Data'}
            </button>
          </div>

          {/* Webhooks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Webhooks Configuration</h2>
            <p className="text-gray-600 mb-4">
              Configure these webhooks in your Shopify store to enable real-time syncing:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
                <p className="font-semibold text-gray-900">orders/create</p>
                <p className="text-sm text-gray-600">Triggered when a new order is created</p>
                <code className="text-xs text-gray-700 mt-2 block break-words">
                  https://your-domain.com/api/webhooks/shopify
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                <p className="font-semibold text-gray-900">orders/updated</p>
                <p className="text-sm text-gray-600">Triggered when an order is updated</p>
                <code className="text-xs text-gray-700 mt-2 block break-words">
                  https://your-domain.com/api/webhooks/shopify
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded border-l-4 border-purple-500">
                <p className="font-semibold text-gray-900">customers/create</p>
                <p className="text-sm text-gray-600">Triggered when a new customer is created</p>
                <code className="text-xs text-gray-700 mt-2 block break-words">
                  https://your-domain.com/api/webhooks/shopify
                </code>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> To set up webhooks in your Shopify admin:
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Go to Settings → Apps and integrations → Webhooks</li>
                  <li>Create new webhook for each topic above</li>
                  <li>Use the URLs provided above</li>
                  <li>Select JSON as the data format</li>
                </ol>
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {status !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="whitespace-pre-wrap text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
