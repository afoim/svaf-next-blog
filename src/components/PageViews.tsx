'use client';

import { useEffect, useState, useRef } from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';

const API = 'https://t.2x.nz/batch';
const cache = new Map<string, number>();

interface Props {
  pathname: string;
  className?: string;
}

export function PageViews({ pathname, className }: Props) {
  const [views, setViews] = useState<number | null>(cache.get(pathname) ?? null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    const cached = cache.get(pathname);
    if (cached !== undefined) {
      setViews(cached);
      return;
    }

    fetched.current = true;
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify([pathname]),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: number[] | null) => {
        if (data && data[0] != null) {
          cache.set(pathname, data[0]);
          setViews(data[0]);
        } else {
          setViews(0);
        }
      })
      .catch(() => setViews(0));
  }, [pathname]);

  if (views === null) return null;

  return (
    <span className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 inline-block">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <NumberTicker value={views} />
    </span>
  );
}
