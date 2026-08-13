'use client';

import { useEffect, useState } from 'react';
import {
  addAddressForUser,
  refreshAddressesForCurrentUser,
  removeAddressForUser,
  setDefaultAddressForUser,
} from '@/lib/address-sync';
import { useAddressStore } from '@/store/address.store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Address } from '@/types/commerce';
import { getMobileValidationError, sanitizeMobileInput } from '@/lib/mobile';
import { AddressLocationFields } from '@/components/address/address-location-fields';
import {
  ADDRESS_FIELD_ERROR_CLASS,
  getMissingAddressFields,
  type AddressRequiredField,
} from '@/lib/address-validation';
import { cn } from '@/lib/utils';

const empty: Omit<Address, 'id'> = {
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

export default function AccountAddressesPage() {
  const { user, isAuthenticated } = useAuth();
  const addresses = useAddressStore((s) => s.addresses);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [missingFields, setMissingFields] = useState<AddressRequiredField[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.partyId) {
      setLoadingAddresses(false);
      return;
    }
    let cancelled = false;
    setLoadingAddresses(true);
    void refreshAddressesForCurrentUser()
      .then(() => {
        if (!cancelled) setError('');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load addresses');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAddresses(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.partyId]);

  function clearFieldError(field: AddressRequiredField) {
    setMissingFields((prev) => prev.filter((f) => f !== field));
  }

  async function save() {
    const missing = getMissingAddressFields(form);
    if (missing.length > 0) {
      setMissingFields(missing);
      setError('Please fill all required address fields.');
      setMobileError(missing.includes('mobile') ? 'Mobile number is required' : '');
      return;
    }
    setMissingFields([]);
    const nextMobileError = getMobileValidationError(form.mobile);
    if (nextMobileError) {
      setMobileError(nextMobileError);
      setMissingFields(['mobile']);
      setError('');
      return;
    }
    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      setError('Postal code must be a 6-digit PIN code.');
      setMissingFields(['postalCode']);
      setMobileError('');
      return;
    }
    setError('');
    setMobileError('');
    setMissingFields([]);
    setSaving(true);
    try {
      await addAddressForUser({ ...form, isDefault: addresses.length === 0 || form.isDefault });
      setForm(empty);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold uppercase tracking-wide">Saved addresses</h2>
        <Button
          variant={showForm ? 'outline' : 'accent'}
          onClick={() => {
            setShowForm((v) => !v);
            setError('');
            setMobileError('');
            setMissingFields([]);
            setForm(empty);
          }}
        >
          {showForm ? 'Cancel' : 'Add address'}
        </Button>
      </div>

      {error && !showForm && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showForm && (
        <div className="grid gap-4 rounded-lg border p-6 sm:grid-cols-2">
          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
          <div>
            <Input
              placeholder="Full name *"
              className={cn(missingFields.includes('name') && ADDRESS_FIELD_ERROR_CLASS)}
              value={form.name}
              aria-invalid={missingFields.includes('name')}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearFieldError('name');
              }}
            />
          </div>
          <div>
            <Input
              placeholder="10-digit mobile *"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              className={cn(
                (mobileError || missingFields.includes('mobile')) && ADDRESS_FIELD_ERROR_CLASS,
              )}
              value={form.mobile}
              aria-invalid={Boolean(mobileError || missingFields.includes('mobile'))}
              onChange={(e) => {
                setForm({ ...form, mobile: sanitizeMobileInput(e.target.value) });
                if (mobileError) setMobileError('');
                clearFieldError('mobile');
              }}
              onBlur={() => {
                if (!form.mobile) {
                  setMobileError('Mobile number is required');
                  setMissingFields((prev) =>
                    prev.includes('mobile') ? prev : [...prev, 'mobile'],
                  );
                  return;
                }
                const next = getMobileValidationError(form.mobile) ?? '';
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
          <Input
            className={cn(
              'sm:col-span-2',
              missingFields.includes('addressLine1') && ADDRESS_FIELD_ERROR_CLASS,
            )}
            placeholder="Address line *"
            value={form.addressLine1}
            aria-invalid={missingFields.includes('addressLine1')}
            onChange={(e) => {
              setForm({ ...form, addressLine1: e.target.value });
              clearFieldError('addressLine1');
            }}
          />
          <AddressLocationFields
            value={{
              postalCode: form.postalCode,
              city: form.city,
              state: form.state,
              stateCode: form.stateCode,
            }}
            invalidFields={missingFields}
            onClearInvalid={clearFieldError}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />
          <Button onClick={() => void save()} disabled={saving} className="sm:col-span-2 w-fit">
            {saving ? 'Saving…' : 'Save address'}
          </Button>
        </div>
      )}

      {loadingAddresses ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((addr) => (
            <li key={addr.id} className="rounded-lg border p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {addr.name}{' '}
                    {addr.isDefault && (
                      <span className="text-xs text-muted-foreground">(Default)</span>
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
                <div className="flex flex-col gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void setDefaultAddressForUser(addr.id).catch((err) => {
                        setError(err instanceof Error ? err.message : 'Failed to set default');
                      })}
                    >
                      Set default
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void removeAddressForUser(addr.id).catch((err) => {
                      setError(err instanceof Error ? err.message : 'Failed to remove address');
                    })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
