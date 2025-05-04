'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { EchoInitializer } from '@/components/EchoInitializer';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <EchoInitializer />
      {children}
    </SessionProvider>
  );
} 