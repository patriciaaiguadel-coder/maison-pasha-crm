import { Role, OrderStatus, SupplierStatus } from "@prisma/client";

export interface UserSession {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
}

export interface CustomerWithOrders {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  orders: OrderWithItems[];
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  supplierStatus: SupplierStatus;
  notifiedSupplier: boolean;
  createdAt: Date;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
