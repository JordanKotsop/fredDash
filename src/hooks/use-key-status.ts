'use client';

import { useState, useEffect } from 'react';

export interface KeyStatus {
  fred: boolean;
  openai: boolean;
  allConfigured: boolean;
}

export function useKeyStatus() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json() as Promise<KeyStatus>)
      .then(setStatus)
      .catch(() => setStatus({ fred: false, openai: false, allConfigured: false }))
      .finally(() => setLoading(false));
  }, []);

  return { status, loading };
}
