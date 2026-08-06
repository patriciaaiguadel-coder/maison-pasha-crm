'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analysis {
  id: string;
  type: string;
  insights: string[];
  recommendations: any[];
  status: string;
  createdAt: string;
}

export default function SourcingPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sourcing/run');
      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async () => {
    try {
      setRunning(true);
      const response = await fetch('/api/sourcing/run', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ Analysis Complete!\n\n${data.message}\n\nRecommendations: ${data.stats.recommendationsFound}`);
        fetchAnalyses();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to run agent');
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AI Sourcing Agent
          </h1>
          <p className="text-gray-600">
            Intelligent product analysis and supplier opportunity discovery
          </p>
        </div>

        {/* Main Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Control Panel</h2>
              <p className="text-sm text-gray-500">Launch AI analysis to find sourcing opportunities</p>
            </div>
            <button
              onClick={runAgent}
              disabled={running || loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
            >
              {running ? '🔄 Running Agent...' : '▶️ Launch Agent'}
            </button>
          </div>

          {running && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-700 font-semibold">🚀 Agent is analyzing your products...</p>
              <div className="mt-2 w-full bg-gray-200 rounded h-2">
                <div className="bg-blue-600 h-2 rounded animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>

          {analyses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No analyses yet. Click "Launch Agent" to get started!</p>
            </div>
          ) : (
            analyses.map(analysis => (
              <div key={analysis.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {analysis.type === 'product_analysis' ? '📊 Product Analysis' : '📈 ' + analysis.type}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {analysis.status}
                  </span>
                </div>

                {/* Insights */}
                {analysis.insights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💡 Key Insights</h4>
                    <ul className="space-y-2">
                      {analysis.insights.slice(0, 3).map((insight, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Recommendations</h4>
                    <div className="space-y-2">
                      {analysis.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded border-l-4 border-indigo-500">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{rec.title}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          {rec.estimatedSavings && (
                            <p className="text-sm text-green-600 font-semibold mt-2">
                              💰 Est. Savings: AED {rec.estimatedSavings.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/dashboard/sourcing/${analysis.id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                >
                  View Full Analysis →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
