'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ADDRESS_FIELD_ERROR_CLASS } from '@/lib/address-validation';

function randomTwoDigit() {
  return Math.floor(Math.random() * 90) + 10; // 10–99
}

function createCaptcha() {
  const a = randomTwoDigit();
  const b = randomTwoDigit();
  return { a, b, answer: a + b };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
  captcha?: string;
}

function validateContactForm(values: {
  name: string;
  email: string;
  message: string;
  captchaInput: string;
  captchaAnswer: number;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required.';
  }

  const typed = values.captchaInput.trim();
  if (!typed) {
    errors.captcha = 'Please solve the captcha.';
  } else if (!/^\d+$/.test(typed) || Number(typed) !== values.captchaAnswer) {
    errors.captcha = 'Incorrect captcha answer. Please try again.';
  }

  return errors;
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const captchaLabel = useMemo(
    () => `What is ${captcha.a} + ${captcha.b}?`,
    [captcha.a, captcha.b],
  );

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function refreshCaptcha() {
    setCaptcha(createCaptcha());
    setCaptchaInput('');
    clearError('captcha');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(false);

    const nextErrors = validateContactForm({
      name,
      email,
      message,
      captchaInput,
      captchaAnswer: captcha.answer,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.captcha && captchaInput.trim()) {
        setCaptcha(createCaptcha());
        setCaptchaInput('');
      }
      return;
    }

    setErrors({});
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setCaptcha(createCaptcha());
    setCaptchaInput('');
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          className={cn('text-sm font-medium', errors.name && 'text-destructive')}
          htmlFor="name"
        >
          Name *
        </label>
        <Input
          id="name"
          className={cn('mt-1', errors.name && ADDRESS_FIELD_ERROR_CLASS)}
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>

      <div>
        <label
          className={cn('text-sm font-medium', errors.email && 'text-destructive')}
          htmlFor="email"
        >
          Email *
        </label>
        <Input
          id="email"
          type="email"
          className={cn('mt-1', errors.email && ADDRESS_FIELD_ERROR_CLASS)}
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>

      <div>
        <label
          className={cn('text-sm font-medium', errors.message && 'text-destructive')}
          htmlFor="message"
        >
          Message *
        </label>
        <textarea
          id="message"
          className={cn(
            'mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            errors.message && ADDRESS_FIELD_ERROR_CLASS,
          )}
          value={message}
          aria-invalid={Boolean(errors.message)}
          onChange={(e) => {
            setMessage(e.target.value);
            clearError('message');
          }}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">{errors.message}</p>
        )}
      </div>

      <div>
        <label
          className={cn('text-sm font-medium', errors.captcha && 'text-destructive')}
          htmlFor="captcha"
        >
          Captcha *
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-foreground">
            What is {captcha.a} + {captcha.b}? =
          </span>
          <Input
            id="captcha"
            className={cn('h-9 w-28', errors.captcha && ADDRESS_FIELD_ERROR_CLASS)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter the sum"
            value={captchaInput}
            aria-invalid={Boolean(errors.captcha)}
            aria-label={captchaLabel}
            onChange={(e) => {
              setCaptchaInput(e.target.value.replace(/\D/g, '').slice(0, 3));
              clearError('captcha');
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={refreshCaptcha}
            aria-label="Refresh captcha"
            title="Refresh captcha"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {errors.captcha && (
          <p className="mt-1 text-xs text-destructive">{errors.captcha}</p>
        )}
      </div>

      {submitted && (
        <p className="text-sm text-green-700">
          Thanks! Your message has been submitted.
        </p>
      )}

      <Button type="submit" size="lg">
        Send Message
      </Button>
    </form>
  );
}
