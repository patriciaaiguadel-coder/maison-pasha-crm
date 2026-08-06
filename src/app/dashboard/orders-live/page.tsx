'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function OrdersLivePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchOrders();

    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.orders) {
        setOrders(data.orders);
        calculateStats(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const stats = {
      totalOrders: orderList.length,
      pendingOrders: orderList.filter(o => o.status === 'PENDING').length,
      confirmedOrders: orderList.filter(o => o.status === 'CONFIRMED').length,
      shippedOrders: orderList.filter(o => o.status === 'SHIPPED').length,
      totalRevenue: orderList.reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: orderList.length > 0
        ? orderList.reduce((sum, o) => sum + o.totalAmount, 0) / orderList.length
        : 0,
    };
    setStats(stats);
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'CONFIRMED':
        return '✅';
      case 'SHIPPED':
        return '🚚';
      case 'DELIVERED':
        return '📦';
      case 'CANCELLED':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Orders Live</h1>
              <p className="text-gray-600 text-sm mt-1">Real-time Shopify order tracking</p>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Refresh Toggle */}
      <div className="max-w-7xl mx-auto px-6 py-3">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="mr-2 w-4 h-4"
          />
          <span className="text-gray-700">
            {autoRefresh ? '🟢 Auto-refresh enabled' : '⚪ Auto-refresh disabled'}
          </span>
        </label>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
              <p className="text-gray-600 text-sm font-semibold">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
              <p className="text-gray-600 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
              <p className="text-gray-600 text-sm font-semibold">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.confirmedOrders}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
              <p className="text-gray-600 text-sm font-semibold">Shipped</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.shippedOrders}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
              <p className="text-gray-600 text-sm font-semibold">Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                AED {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: AED {stats.averageOrderValue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-2">
          {['all', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition font-semibold text-sm ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '📋 All Orders' : `${getStatusIcon(status)} ${status}`}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-lg font-bold text-blue-600 hover:text-blue-800"
                        >
                          {order.orderNumber}
                        </Link>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        👤 {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        📧 {order.customer.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        AED {order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 py-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-gray-600">
                          {item.quantity}x @ AED {item.price}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
