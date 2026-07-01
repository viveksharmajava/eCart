'use client';

import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';

export default function AccountProfilePage() {
  const { user } = useAuth();

  return (
    <section className="max-w-lg space-y-4 rounded-lg border p-6">
      <h2 className="font-semibold uppercase tracking-wide">Profile</h2>
      <p className="text-sm text-muted-foreground">
        Profile updates sync with the party service in a future release. Your session details are shown below.
      </p>
      <div>
        <label className="text-sm font-medium">First name</label>
        <Input className="mt-1" value={user?.firstName ?? ''} readOnly />
      </div>
      <div>
        <label className="text-sm font-medium">Last name</label>
        <Input className="mt-1" value={user?.lastName ?? ''} readOnly />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input className="mt-1" value={user?.email ?? user?.username ?? ''} readOnly />
      </div>
    </section>
  );
}
