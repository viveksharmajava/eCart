'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ContactForm() {
  return (
    <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input id="name" className="mt-1" required />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" className="mt-1" required />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>
      <Button type="submit" size="lg">
        Send Message
      </Button>
    </form>
  );
}
