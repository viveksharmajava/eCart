'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
          cancel?: () => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleLoginButton({
  onCredential,
  disabled,
  className,
  label = 'Continue with Google',
}: GoogleLoginButtonProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptError, setScriptError] = useState('');
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';
  const callbackRef = useRef(onCredential);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  callbackRef.current = onCredential;

  const handleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    setScriptError('');
    try {
      await callbackRef.current(credential);
    } catch (err) {
      setScriptError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) {
        setScriptError('Google Sign-In failed to initialize.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            void handleCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const host = googleBtnRef.current;
      if (host) {
        host.innerHTML = '';
        window.google.accounts.id.renderButton(host, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.max(host.clientWidth || 0, 320),
        });
      }

      setReady(true);
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gsi="true"]');
    if (existing && window.google?.accounts?.id) {
      initializeGoogle();
      return () => {
        cancelled = true;
      };
    }

    const script = existing ?? document.createElement('script');
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = 'true';
      document.body.appendChild(script);
    }

    const onLoad = () => initializeGoogle();
    const onError = () => setScriptError('Unable to load Google Sign-In.');

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    if (window.google?.accounts?.id) onLoad();

    return () => {
      cancelled = true;
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
  }, [clientId, handleCredential]);

  const handleFallbackClick = useCallback(() => {
    if (!clientId) {
      setScriptError(
        'Google login is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in ecart .env.',
      );
      return;
    }
    if (!ready || !window.google?.accounts?.id) {
      setScriptError('Google Sign-In is still loading. Please try again.');
      return;
    }
    setScriptError('');
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setScriptError(
          'Google One Tap was blocked. Use the Google button above, and ensure http://localhost:3000 is an Authorized JavaScript origin in Google Cloud Console.',
        );
      }
    });
  }, [clientId, ready]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Official GIS button (most reliable) */}
      <div
        ref={googleBtnRef}
        className={cn(
          'flex min-h-12 w-full items-center justify-center overflow-hidden rounded-md',
          (disabled || loading) && 'pointer-events-none opacity-60',
        )}
        aria-label={label}
      />

      {/* Fallback custom trigger if GIS button fails to render */}
      {clientId && !ready && !scriptError && (
        <p className="text-center text-xs text-muted-foreground">Loading Google Sign-In…</p>
      )}

      {ready && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled || loading}
          className={cn(
            'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/40 bg-transparent px-3 text-xs font-medium text-muted-foreground',
            'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          <GoogleIcon className="h-4 w-4 shrink-0" />
          {loading ? 'Signing in…' : 'Try Google One Tap'}
        </button>
      )}

      {scriptError && <p className="text-xs text-destructive">{scriptError}</p>}
      {!clientId && (
        <p className="text-xs text-muted-foreground">
          Add your Google OAuth Web Client ID as NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable this button.
        </p>
      )}
    </div>
  );
}

export function AuthOrDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-widest">
        <span className="bg-background px-3 text-muted-foreground">Or</span>
      </div>
    </div>
  );
}
