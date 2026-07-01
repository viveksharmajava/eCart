'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { computeCartTotals } from '@/lib/commerce';
import { formatCurrency } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { createOrder } from '@/services/orders.client';
import { useAddressStore } from '@/store/address.store';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Address } from '@/types/commerce';
import { getPaymentProvider } from '@/features/checkout/payment-providers';

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
] as const;

const emptyAddress: Omit<Address, 'id'> = {
  name: '',
  mobile: '',
  addressLine1: '',
  landmark: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  isDefault: false,
};

export function CheckoutView() {
  const router = useRouter();
  const { user, isAuthenticated, register } = useAuth();
  const items = useCartStore((s) => s.items);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.addAddress);
  const getDefault = useAddressStore((s) => s.getDefault);

  const {
    step,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    createAccount,
    guestEmail,
    guestFirstName,
    guestLastName,
    guestMobile,
    setStep,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
    setGuestDetails,
    reset,
  } = useCheckoutStore();

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(emptyAddress);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(
    () => computeCartTotals(items, couponDiscount, shippingMethod),
    [items, couponDiscount, shippingMethod],
  );

  useEffect(() => {
    if (items.length === 0) return;
    trackEvent({ name: 'begin_checkout', cartValue: totals.grandTotal });
  }, [items.length, totals.grandTotal]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestDetails({
        guestEmail: user.email ?? user.username,
        guestFirstName: user.firstName ?? '',
        guestLastName: user.lastName ?? '',
      });
      const saved = getDefault();
      if (saved && !shippingAddress) setShippingAddress(saved);
    }
  }, [isAuthenticated, user, getDefault, setGuestDetails, setShippingAddress, shippingAddress]);

  if (items.length === 0) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="text-2xl font-black uppercase">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-8" asChild>
          <Link href={ROUTES.products}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  function updateAddressField<K extends keyof Omit<Address, 'id'>>(key: K, value: Omit<Address, 'id'>[K]) {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveAddress() {
    if (!addressForm.name || !addressForm.mobile || !addressForm.addressLine1 || !addressForm.city || !addressForm.postalCode) {
      setError('Please fill all required address fields.');
      return;
    }
    setError('');
    const saved = addAddress(addressForm);
    setShippingAddress(saved);
    setAddressForm(emptyAddress);
  }

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError('');
    try {
      if (!shippingAddress) {
        setError('Please select or add a shipping address.');
        setStep('address');
        return;
      }

      if (!isAuthenticated && createAccount && password.length >= 8) {
        await register({
          firstName: guestFirstName || shippingAddress.name.split(' ')[0] || 'Guest',
          lastName: guestLastName || shippingAddress.name.split(' ').slice(1).join(' ') || 'Customer',
          email: guestEmail || `${guestMobile}@guest.playpro.local`,
          password,
          mobile: guestMobile || shippingAddress.mobile,
        });
      }

      const order = await createOrder({
        items,
        guestEmail: guestEmail || shippingAddress.mobile,
        guestFirstName: guestFirstName || shippingAddress.name,
        guestLastName: guestLastName,
        orderName: `PlayPro order — ${shippingAddress.city}`,
      });

      if (paymentMethod !== 'cod') {
        const provider = getPaymentProvider(paymentMethod === 'stripe' ? 'stripe' : 'razorpay');
        const intent = await provider.createIntent({
          orderId: order.orderId,
          grandTotal: totals.grandTotal,
          currencyUom: totals.currency,
        });
        await provider.confirmPayment(intent.id);
      }

      trackEvent({ name: 'purchase', orderId: order.orderId, value: totals.grandTotal });
      clearCart();
      reset();
      router.push(`${ROUTES.checkoutSuccess}?orderId=${encodeURIComponent(order.orderId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-store py-8 lg:py-12">
      <h1 className="text-3xl font-black uppercase">Checkout</h1>

      <div className="mt-8 flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex-1 border-b-2 pb-2 text-center text-xs font-semibold uppercase sm:text-sm ${
              step === s.id ? 'border-foreground text-foreground' : 'border-muted text-muted-foreground'
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {step === 'address' && (
            <section className="space-y-6 rounded-lg border p-6">
              <h2 className="font-semibold uppercase tracking-wide">Shipping Address</h2>

              {!isAuthenticated && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      className="mt-1"
                      value={guestEmail}
                      onChange={(e) => setGuestDetails({ guestEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mobile *</label>
                    <Input
                      className="mt-1"
                      value={guestMobile}
                      onChange={(e) => setGuestDetails({ guestMobile: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {addresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Saved addresses</p>
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer gap-3 rounded-md border p-4 ${shippingAddress?.id === addr.id ? 'border-foreground' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={shippingAddress?.id === addr.id}
                        onChange={() => setShippingAddress(addr)}
                      />
                      <div className="text-sm">
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-muted-foreground">
                          {addr.addressLine1}, {addr.city} {addr.postalCode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Full name *</label>
                  <Input className="mt-1" value={addressForm.name} onChange={(e) => updateAddressField('name', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile *</label>
                  <Input className="mt-1" value={addressForm.mobile} onChange={(e) => updateAddressField('mobile', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal code *</label>
                  <Input className="mt-1" value={addressForm.postalCode} onChange={(e) => updateAddressField('postalCode', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Address line *</label>
                  <Input className="mt-1" value={addressForm.addressLine1} onChange={(e) => updateAddressField('addressLine1', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">City *</label>
                  <Input className="mt-1" value={addressForm.city} onChange={(e) => updateAddressField('city', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input className="mt-1" value={addressForm.state} onChange={(e) => updateAddressField('state', e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleSaveAddress}>
                  Save & use address
                </Button>
                <Button type="button" onClick={() => setStep('delivery')} disabled={!shippingAddress}>
                  Continue
                </Button>
              </div>
            </section>
          )}

          {step === 'delivery' && (
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="font-semibold uppercase tracking-wide">Delivery</h2>
              {(['standard', 'express'] as const).map((method) => (
                <label key={method} className={`flex cursor-pointer items-center justify-between rounded-md border p-4 ${shippingMethod === method ? 'border-foreground' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={shippingMethod === method} onChange={() => setShippingMethod(method)} />
                    <div>
                      <p className="font-medium capitalize">{method} delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {method === 'standard' ? '3–7 business days' : '1–3 business days'}
                      </p>
                    </div>
                  </div>
                  <span>{method === 'express' ? formatCurrency(199) : totals.shipping === 0 ? 'Free' : formatCurrency(99)}</span>
                </label>
              ))}
              <Button onClick={() => setStep('payment')}>Continue to payment</Button>
            </section>
          )}

          {step === 'payment' && (
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="font-semibold uppercase tracking-wide">Payment</h2>
              {([
                { id: 'cod', label: 'Cash on Delivery' },
                { id: 'razorpay', label: 'Razorpay (mock)' },
                { id: 'stripe', label: 'Stripe (mock)' },
              ] as const).map((option) => (
                <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 ${paymentMethod === option.id ? 'border-foreground' : ''}`}>
                  <input type="radio" checked={paymentMethod === option.id} onChange={() => setPaymentMethod(option.id)} />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
              <Button onClick={() => setStep('review')}>Review order</Button>
            </section>
          )}

          {step === 'review' && (
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="font-semibold uppercase tracking-wide">Review & place order</h2>
              {shippingAddress && (
                <div className="text-sm">
                  <p className="font-medium">Deliver to</p>
                  <p>{shippingAddress.name}</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.addressLine1}, {shippingAddress.city} {shippingAddress.postalCode}
                  </p>
                </div>
              )}
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId ?? ''}`} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{formatCurrency(item.unitPrice * item.quantity, item.currency)}</span>
                  </li>
                ))}
              </ul>

              {!isAuthenticated && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setGuestDetails({ createAccount: e.target.checked })}
                  />
                  Create an account for faster checkout next time
                </label>
              )}
              {!isAuthenticated && createAccount && (
                <div>
                  <label className="text-sm font-medium">Password (min 8 chars)</label>
                  <Input type="password" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}

              <Button size="lg" onClick={handlePlaceOrder} disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place order'}
              </Button>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-lg border p-6">
          <h2 className="font-semibold uppercase">Order summary</h2>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, totals.currency)}</span></div>
            {totals.couponDiscount > 0 && (
              <div className="flex justify-between text-green-700"><span>Coupon</span><span>-{formatCurrency(totals.couponDiscount, totals.currency)}</span></div>
            )}
            <div className="flex justify-between"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping, totals.currency)}</span></div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totals.grandTotal, totals.currency)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
