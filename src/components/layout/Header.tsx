'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function Header() {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const path = pathname.replace(/\/$/, '') || '/';
    if (path === '/') return [];
    const parts = path.split('/').filter(Boolean);
    const result: { label: string; href: string }[] = [];
    let accumulated = '';
    for (const part of parts) {
      accumulated += '/' + part;
      result.push({ label: part, href: accumulated });
    }
    return result;
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="relative flex h-10 items-center justify-between px-2">
        <div className="flex items-center gap-1 min-w-0">
          <a href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0"
              alt="Home"
              className="h-6 w-6 rounded-full"
            />
          </a>
          {crumbs.map((crumb, i) => (
            <div key={crumb.href} className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/40 shrink-0">/</span>
              <a
                href={crumb.href}
                className={`text-xs truncate shrink min-w-0 transition-colors ${
                  i === crumbs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {crumb.label}
              </a>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            className="inline-flex items-center justify-center h-8 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 mr-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            首页
          </a>
        </div>
      </div>
    </nav>
  );
}
