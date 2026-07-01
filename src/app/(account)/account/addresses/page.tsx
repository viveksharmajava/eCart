'use client';

import { useState } from 'react';
import { useAddressStore } from '@/store/address.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Address } from '@/types/commerce';

const empty: Omit<Address, 'id'> = {
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

export default function AccountAddressesPage() {
  const { addresses, addAddress, removeAddress, setDefault } = useAddressStore();
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  function save() {
    if (!form.name || !form.addressLine1 || !form.city || !form.postalCode) return;
    addAddress(form);
    setForm(empty);
    setShowForm(false);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold uppercase tracking-wide">Saved addresses</h2>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Add address'}
        </Button>
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-lg border p-6 sm:grid-cols-2">
          <Input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Mobile *" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input className="sm:col-span-2" placeholder="Address line *" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
          <Input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input placeholder="Postal code *" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Button onClick={save} className="sm:col-span-2 w-fit">Save address</Button>
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((addr) => (
            <li key={addr.id} className="rounded-lg border p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{addr.name} {addr.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}</p>
                  <p className="text-muted-foreground">{addr.addressLine1}, {addr.city} {addr.postalCode}</p>
                  <p className="text-muted-foreground">{addr.mobile}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!addr.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => setDefault(addr.id)}>Set default</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeAddress(addr.id)}>Remove</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
