'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AccountResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword.trim()) {
      setError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Unable to change password');
      }
      setSuccess(data.message ?? 'Your password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-lg space-y-4 rounded-lg border p-6">
      <h2 className="font-semibold uppercase tracking-wide">Reset password</h2>
      <p className="text-sm text-muted-foreground">
        Enter your current password and choose a new password for your account.
      </p>
      <form className="space-y-4" onSubmit={handlePasswordReset}>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <div>
          <label className="text-sm font-medium" htmlFor="currentPassword">
            Current password
          </label>
          <Input
            id="currentPassword"
            type="password"
            className="mt-1"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="newPassword">
            New password
          </label>
          <Input
            id="newPassword"
            type="password"
            className="mt-1"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            className="mt-1"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Updating…' : 'Reset password'}
        </Button>
      </form>
    </section>
  );
}
