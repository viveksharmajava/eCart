import type { PaymentIntent, PaymentProvider, PaymentResult, OrderSummary } from '@/types/commerce';

class RazorpayProvider implements PaymentProvider {
  id = 'razorpay' as const;

  async createIntent(order: OrderSummary): Promise<PaymentIntent> {
    return {
      id: `rzp_mock_${order.orderId}`,
      provider: 'razorpay',
      amount: order.grandTotal ?? 0,
      currency: order.currencyUom ?? 'INR',
    };
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    return { success: true, transactionId: intentId };
  }
}

class StripeProvider implements PaymentProvider {
  id = 'stripe' as const;

  async createIntent(order: OrderSummary): Promise<PaymentIntent> {
    return {
      id: `pi_mock_${order.orderId}`,
      provider: 'stripe',
      amount: order.grandTotal ?? 0,
      currency: order.currencyUom ?? 'INR',
      clientSecret: 'mock_secret',
    };
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    return { success: true, transactionId: intentId };
  }
}

class PayPalProvider implements PaymentProvider {
  id = 'paypal' as const;

  async createIntent(order: OrderSummary): Promise<PaymentIntent> {
    return {
      id: `pp_mock_${order.orderId}`,
      provider: 'paypal',
      amount: order.grandTotal ?? 0,
      currency: order.currencyUom ?? 'INR',
    };
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    return { success: true, transactionId: intentId };
  }
}

const providers: Record<PaymentProvider['id'], PaymentProvider> = {
  razorpay: new RazorpayProvider(),
  stripe: new StripeProvider(),
  paypal: new PayPalProvider(),
};

export function getPaymentProvider(id: PaymentProvider['id']): PaymentProvider {
  return providers[id];
}

/** Map catalog gateway_provider to a mock checkout provider. */
export function resolvePaymentProviderId(
  gatewayProvider?: string | null,
): PaymentProvider['id'] | null {
  const key = (gatewayProvider || '').trim().toUpperCase();
  if (!key) return null;
  if (key === 'STRIPE') return 'stripe';
  if (key === 'PAYPAL') return 'paypal';
  if (key === 'RAZORPAY' || key === 'PAYU' || key === 'PHONEPE' || key === 'CUSTOM') {
    return 'razorpay';
  }
  return 'razorpay';
}
