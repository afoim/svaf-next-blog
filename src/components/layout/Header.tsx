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
    // basePath 是 /posts，pathname 已去掉此前缀，手动补回
    let accumulated = '/posts';
    result.push({ label: 'posts', href: accumulated });
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
          {/* 空 div 保持布局平衡（原首页按钮移除） */}
        </div>
      </div>
    </nav>
  );
}
