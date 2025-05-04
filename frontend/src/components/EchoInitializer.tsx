'use client';

import { useEffect } from 'react';
import { initializeEcho } from '@/services/echo';

export function EchoInitializer() {
  useEffect(() => {
    initializeEcho();
  }, []);

  return null; // This component doesn't render anything
} 