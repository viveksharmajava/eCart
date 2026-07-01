import type { OrderSummary } from '@/types/commerce';
import { getServiceAuthHeader, httpClient } from './http.client';

export interface CreateOrderRequest {
  partyId: string;
  orderTypeId?: string;
  statusId?: string;
  currencyUom?: string;
  productStoreId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export async function createOrder(request: CreateOrderRequest): Promise<OrderSummary> {
  return httpClient('/orders', {
    method: 'POST',
    body: request,
    authHeader: getServiceAuthHeader(),
  });
}

export async function getOrder(orderId: string): Promise<OrderSummary> {
  return httpClient(`/orders/${encodeURIComponent(orderId)}`, {
    authHeader: getServiceAuthHeader(),
  });
}
