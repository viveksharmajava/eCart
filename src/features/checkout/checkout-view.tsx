'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants';
import { clearPersistedPartyCart, useAuth } from '@/hooks/use-auth';
import {
  addAddressForUser,
  updateAddressForUser,
} from '@/lib/address-sync';
import { computeCartTotals } from '@/lib/commerce';
import { formatCurrency } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { createOrder } from '@/services/orders.client';
import {
  checkCartInventory,
  parseInventoryFailureProductIds,
} from '@/services/inventory.client';
import { useAddressStore } from '@/store/address.store';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Address } from '@/types/commerce';
import { getPaymentProvider, resolvePaymentProviderId } from '@/features/checkout/payment-providers';
import { getMobileValidationError, sanitizeMobileInput } from '@/lib/mobile';
import { AddressLocationFields } from '@/components/address/address-location-fields';
import {
  ADDRESS_FIELD_ERROR_CLASS,
  getMissingAddressFields,
  type AddressRequiredField,
} from '@/lib/address-validation';
import { cn } from '@/lib/utils';
import { getStorefrontPaymentMethods } from '@/services/payment-methods.service';
import type { StorefrontPaymentMethod } from '@/types/store';

const STEPS = [
  { id: 'address', label: 'Address' },
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
  stateCode: '',
  country: 'India',
  postalCode: '',
  isDefault: false,
};

export function CheckoutView() {
  const router = useRouter();
  const { user, authHeader, isAuthenticated, register } = useAuth();
  const items = useCartStore((s) => s.items);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const outOfStockProductIds = useCartStore((s) => s.outOfStockProductIds);
  const setOutOfStockProductIds = useCartStore((s) => s.setOutOfStockProductIds);
  const clearOutOfStockProductIds = useCartStore((s) => s.clearOutOfStockProductIds);
  const addresses = useAddressStore((s) => s.addresses);
  const getDefault = useAddressStore((s) => s.getDefault);

  const {
    step,
    shippingAddress,
    paymentMethodId,
    createAccount,
    guestEmail,
    guestFirstName,
    guestLastName,
    guestMobile,
    setStep,
    setShippingAddress,
    setPaymentMethodId,
    setGuestDetails,
    reset,
  } = useCheckoutStore();

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(emptyAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [missingFields, setMissingFields] = useState<AddressRequiredField[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<StorefrontPaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  const totals = useMemo(
    () => computeCartTotals(items, couponDiscount),
    [items, couponDiscount],
  );

  useEffect(() => {
    if (items.length === 0) return;
    trackEvent({ name: 'begin_checkout', cartValue: totals.grandTotal });
  }, [items.length, totals.grandTotal]);

  useEffect(() => {
    let cancelled = false;
    setPaymentMethodsLoading(true);
    void getStorefrontPaymentMethods()
      .then((methods) => {
        if (cancelled) return;
        setPaymentMethods(methods);
        const stillValid = methods.some((m) => m.paymentMethodId === paymentMethodId);
        if (!stillValid) {
          setPaymentMethodId(methods[0]?.paymentMethodId ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPaymentMethods([]);
          setPaymentMethodId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPaymentMethodsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Only load once per checkout mount / when store methods change source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestDetails({
        guestEmail: user.email ?? user.username,
        guestFirstName: user.firstName ?? '',
        guestLastName: user.lastName ?? '',
      });
      // Drop a previously selected address that no longer belongs to this user
      if (shippingAddress && !addresses.some((a) => a.id === shippingAddress.id)) {
        setShippingAddress(null);
      }
      const saved = getDefault();
      if (saved && (!shippingAddress || !addresses.some((a) => a.id === shippingAddress.id))) {
        setShippingAddress(saved);
      }
    }
  }, [
    isAuthenticated,
    user,
    addresses,
    getDefault,
    setGuestDetails,
    setShippingAddress,
    shippingAddress,
  ]);

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

  function clearFieldError(field: AddressRequiredField) {
    setMissingFields((prev) => prev.filter((f) => f !== field));
  }

  function resetAddressForm() {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setError('');
    setMobileError('');
    setMissingFields([]);
  }

  function handleAddNewAddress() {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
    setError('');
    setMobileError('');
    setMissingFields([]);
  }

  function handleEditAddress(addr: Address) {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      mobile: sanitizeMobileInput(addr.mobile),
      addressLine1: addr.addressLine1,
      landmark: addr.landmark,
      city: addr.city,
      state: addr.state,
      stateCode: addr.stateCode ?? '',
      country: addr.country,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
    setError('');
    setMobileError('');
    setMissingFields([]);
  }

  async function handleSaveAddress() {
    const missing = getMissingAddressFields(addressForm);
    if (missing.length > 0) {
      setMissingFields(missing);
      setError('Please fill all required address fields.');
      setMobileError(missing.includes('mobile') ? 'Mobile number is required' : '');
      return;
    }
    setMissingFields([]);
    const nextMobileError = getMobileValidationError(addressForm.mobile);
    if (nextMobileError) {
      setMobileError(nextMobileError);
      setMissingFields(['mobile']);
      setError('');
      return;
    }
    if (!/^\d{6}$/.test(addressForm.postalCode.trim())) {
      setError('Postal code must be a 6-digit PIN code.');
      setMissingFields(['postalCode']);
      setMobileError('');
      return;
    }
    if (!user?.partyId || !authHeader) {
      setError('Please sign in again to save your address.');
      return;
    }
    setError('');
    setMobileError('');
    setMissingFields([]);

    try {
      if (editingAddressId) {
        const updated = await updateAddressForUser(editingAddressId, addressForm);
        if (updated) setShippingAddress(updated);
      } else {
        const saved = await addAddressForUser(addressForm);
        setShippingAddress(saved);
      }
      resetAddressForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save address.');
    }
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

      const unavailable = await checkCartInventory(items);
      if (unavailable.length > 0) {
        setOutOfStockProductIds(unavailable.map((row) => row.productId));
        setError('Some items in your cart are currently out of stock. Please remove them to continue.');
        router.push(ROUTES.cart);
        return;
      }
      clearOutOfStockProductIds();

      if (!isAuthenticated && createAccount && password.length >= 8) {
        await register({
          firstName: guestFirstName || shippingAddress.name.split(' ')[0] || 'Guest',
          lastName: guestLastName || shippingAddress.name.split(' ').slice(1).join(' ') || 'Customer',
          email: guestEmail || `${guestMobile}@guest.playpro.local`,
          password,
          mobile: guestMobile || shippingAddress.mobile,
        });
      }

      const selectedPayment = paymentMethods.find((m) => m.paymentMethodId === paymentMethodId);
      if (!selectedPayment) {
        setError('Please select an enabled payment method.');
        setStep('payment');
        return;
      }

      const order = await createOrder({
        items,
        guestEmail: guestEmail || shippingAddress.mobile,
        guestFirstName: guestFirstName || shippingAddress.name,
        guestLastName: guestLastName,
        orderName: `PlayPro order — ${shippingAddress.city}`,
      });

      if (selectedPayment.paymentType !== 'COD') {
        const providerId = resolvePaymentProviderId(selectedPayment.gatewayProvider);
        if (providerId) {
          const provider = getPaymentProvider(providerId);
          const intent = await provider.createIntent({
            orderId: order.orderId,
            grandTotal: totals.grandTotal,
            currencyUom: totals.currency,
          });
          await provider.confirmPayment(intent.id);
        }
      }

      trackEvent({ name: 'purchase', orderId: order.orderId, value: totals.grandTotal });
      clearOutOfStockProductIds();
      clearCart();
      try {
        await clearPersistedPartyCart();
      } catch {
        // Local cart already cleared; party clear is best-effort
      }
      reset();
      router.push(`${ROUTES.checkoutSuccess}?orderId=${encodeURIComponent(order.orderId)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      const inventoryProductIds = parseInventoryFailureProductIds(message);
      if (inventoryProductIds.length > 0) {
        setOutOfStockProductIds(inventoryProductIds);
        setError('Some items in your cart are currently out of stock. Please remove them to continue.');
        router.push(ROUTES.cart);
        return;
      }
      setError(message);
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
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={guestMobile}
                      onChange={(e) =>
                        setGuestDetails({ guestMobile: sanitizeMobileInput(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}

              {addresses.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Saved addresses</p>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`flex items-start gap-3 rounded-md border p-4 ${shippingAddress?.id === addr.id ? 'border-foreground' : ''}`}
                    >
                      <label className="flex flex-1 cursor-pointer gap-3">
                        <input
                          type="radio"
                          name="address"
                          className="mt-1"
                          checked={shippingAddress?.id === addr.id}
                          onChange={() => setShippingAddress(addr)}
                        />
                        <div className="text-sm">
                          <p className="font-medium">
                            {addr.name}
                            {addr.isDefault && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">(Default)</span>
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.addressLine1}, {addr.city} {addr.postalCode}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.state}
                            {addr.stateCode ? ` (${addr.stateCode})` : ''}
                          </p>
                          <p className="text-muted-foreground">{addr.mobile}</p>
                        </div>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Edit address for ${addr.name}`}
                        onClick={() => handleEditAddress(addr)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
                )
              )}

              {!showAddressForm ? (
                <Button type="button" variant="accent" className="gap-2" onClick={handleAddNewAddress}>
                  <Plus className="h-4 w-4" />
                  Add new Address
                </Button>
              ) : (
                <div className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      {editingAddressId ? 'Edit address' : 'New address'}
                    </h3>
                    <Button type="button" variant="ghost" size="sm" onClick={resetAddressForm}>
                      Cancel
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        className={cn(
                          'text-sm font-medium',
                          missingFields.includes('name') && 'text-destructive',
                        )}
                      >
                        Full name *
                      </label>
                      <Input
                        className={cn(
                          'mt-1',
                          missingFields.includes('name') && ADDRESS_FIELD_ERROR_CLASS,
                        )}
                        value={addressForm.name}
                        aria-invalid={missingFields.includes('name')}
                        onChange={(e) => {
                          updateAddressField('name', e.target.value);
                          clearFieldError('name');
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        className={cn(
                          'text-sm font-medium',
                          (mobileError || missingFields.includes('mobile')) && 'text-destructive',
                        )}
                      >
                        Mobile *
                      </label>
                      <Input
                        className={cn(
                          'mt-1',
                          (mobileError || missingFields.includes('mobile')) &&
                            ADDRESS_FIELD_ERROR_CLASS,
                        )}
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={addressForm.mobile}
                        aria-invalid={Boolean(mobileError || missingFields.includes('mobile'))}
                        onChange={(e) => {
                          updateAddressField('mobile', sanitizeMobileInput(e.target.value));
                          if (mobileError) setMobileError('');
                          clearFieldError('mobile');
                        }}
                        onBlur={() => {
                          if (!addressForm.mobile) {
                            setMobileError('Mobile number is required');
                            setMissingFields((prev) =>
                              prev.includes('mobile') ? prev : [...prev, 'mobile'],
                            );
                            return;
                          }
                          const next = getMobileValidationError(addressForm.mobile) ?? '';
                          setMobileError(next);
                          if (next) {
                            setMissingFields((prev) =>
                              prev.includes('mobile') ? prev : [...prev, 'mobile'],
                            );
                          } else {
                            clearFieldError('mobile');
                          }
                        }}
                      />
                      {mobileError && (
                        <p className="mt-1 text-xs text-destructive">{mobileError}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        className={cn(
                          'text-sm font-medium',
                          missingFields.includes('addressLine1') && 'text-destructive',
                        )}
                      >
                        Address line *
                      </label>
                      <Input
                        className={cn(
                          'mt-1',
                          missingFields.includes('addressLine1') && ADDRESS_FIELD_ERROR_CLASS,
                        )}
                        value={addressForm.addressLine1}
                        aria-invalid={missingFields.includes('addressLine1')}
                        onChange={(e) => {
                          updateAddressField('addressLine1', e.target.value);
                          clearFieldError('addressLine1');
                        }}
                      />
                    </div>
                    <AddressLocationFields
                      value={{
                        postalCode: addressForm.postalCode,
                        city: addressForm.city,
                        state: addressForm.state,
                        stateCode: addressForm.stateCode,
                      }}
                      invalidFields={missingFields}
                      onClearInvalid={clearFieldError}
                      onChange={(patch) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          ...patch,
                        }))
                      }
                    />
                  </div>

                  <Button type="button" variant="accent" onClick={handleSaveAddress}>
                    {editingAddressId ? 'Update & use address' : 'Save & use address'}
                  </Button>
                </div>
              )}
            </section>
          )}

          {step === 'payment' && (
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="font-semibold uppercase tracking-wide">Payment</h2>
              {paymentMethodsLoading ? (
                <p className="text-sm text-muted-foreground">Loading payment options…</p>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-destructive">
                  No payment methods are enabled for this store. Please contact support or enable
                  payment options in catalog admin (Stores → Payments).
                </p>
              ) : (
                paymentMethods.map((option) => (
                  <label
                    key={option.paymentMethodId}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 ${
                      paymentMethodId === option.paymentMethodId ? 'border-foreground' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethodId === option.paymentMethodId}
                      onChange={() => setPaymentMethodId(option.paymentMethodId)}
                    />
                    <span className="font-medium">{option.displayName}</span>
                  </label>
                ))
              )}
              <Button
                onClick={() => setStep('review')}
                disabled={!paymentMethodId || paymentMethods.length === 0}
              >
                Review order
              </Button>
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
              <ul className="space-y-3 text-sm">
                {items.map((item) => {
                  const outOfStock = (outOfStockProductIds ?? []).includes(item.productId);
                  return (
                    <li
                      key={`${item.productId}-${item.variantId ?? ''}`}
                      className={cn(
                        'rounded-md border p-3',
                        outOfStock ? 'border-destructive/40 bg-destructive/5' : 'border-transparent',
                      )}
                    >
                      {outOfStock && (
                        <p className="mb-2 text-xs font-medium text-destructive">
                          This item is currently out of stock
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(item.unitPrice * item.quantity, item.currency)}</span>
                          {outOfStock && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeItem(item.productId, item.variantId)}
                              aria-label={`Remove ${item.productName} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
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
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totals.grandTotal, totals.currency)}</span>
          </div>
          {step === 'address' && (
            <Button
              type="button"
              variant="accent"
              className="mt-6 w-full"
              onClick={() => setStep('payment')}
              disabled={!shippingAddress}
            >
              Continue Checkout
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
