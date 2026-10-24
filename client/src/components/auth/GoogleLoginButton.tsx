import React, { useEffect, useRef, useState } from 'react';
import { authService, AdminProfile } from '../../services/authService.js';
import { env } from '../../config/env.js';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              width?: number;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        reject(new Error('Could not load Google Sign-In'));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

export interface GoogleLoginButtonProps {
  onSession: (token: string, user: AdminProfile) => void;
  onError: (message: string) => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSession, onError }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [scriptError, setScriptError] = useState('');

  // Keep the latest callbacks in refs so the GIS button only needs to re-render
  // when the measured width changes — not on every parent render.
  const onSessionRef = useRef(onSession);
  const onErrorRef = useRef(onError);
  onSessionRef.current = onSession;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!env.VITE_GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    let lastWidth = 0;

    loadGis()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: env.VITE_GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            if (busyRef.current) return;
            busyRef.current = true;
            try {
              const session = await authService.googleLogin(credential);
              onSessionRef.current(session.token, session.user);
            } catch (err) {
              onErrorRef.current(err instanceof Error ? err.message : 'Google sign-in failed');
            } finally {
              busyRef.current = false;
            }
          },
        });

        // The GIS button renders inside an iframe with a fixed pixel width, so it
        // can't stretch to 100% reliably. Measure the container and feed it the
        // exact width so it lines up with the email/password inputs — and re-render
        // on resize so it stays aligned.
        const render = () => {
          if (cancelled || !buttonRef.current) return;
          const width = Math.floor(buttonRef.current.getBoundingClientRect().width);
          if (!width || width === lastWidth) return;
          lastWidth = width;
          window.google?.accounts?.id?.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center',
            width,
          });
        };

        render();

        const observer = new ResizeObserver(render);
        if (buttonRef.current) observer.observe(buttonRef.current);

        return () => observer.disconnect();
      })
      .catch(() => {
        if (!cancelled) setScriptError('Google Sign-In could not load — check your connection.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      {scriptError ? (
        <p className="text-xs text-rose-500 text-center">{scriptError}</p>
      ) : (
        <div ref={buttonRef} className="flex justify-center w-full min-h-[44px] rounded-full overflow-hidden bg-white" />
      )}
    </div>
  );
};

export default GoogleLoginButton;
