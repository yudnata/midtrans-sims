/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSyncExternalStore } from 'react';
import React from 'react';
import Script from 'next/script';

interface Snap {
  pay: (token: string, options: any) => void;
}

declare global {
  interface Window {
    snap: Snap;
  }
}

export const useSnap = (): { snap: Snap | null; snapEmbed: React.ReactElement | null } => {
  const snap = useSyncExternalStore(
    (callback: () => void) => {
      const onSnapLoaded = () => {
        callback();
      };
      window.addEventListener('midtrans-snap-loaded', onSnapLoaded);
      return () => window.removeEventListener('midtrans-snap-loaded', onSnapLoaded);
    },
    () => (typeof window !== 'undefined' ? window.snap : null),
    () => null
  );

  const snapEmbed = (
    <Script
      src="https://app.sandbox.midtrans.com/snap/snap.js"
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} // Make sure to set this env var
      strategy="lazyOnload"
      onLoad={() => {
        window.dispatchEvent(new Event('midtrans-snap-loaded'));
      }}
    />
  );

  return { snap, snapEmbed };
};
