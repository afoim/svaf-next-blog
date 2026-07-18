'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Heading } from '@/lib/toc';

interface TableOfContentsProps {
  className?: string;
  headings: Heading[];
}

export function TableOfContents({ className, headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  // 滚动高亮追踪（必须客户端）
  useEffect(() => {
    if (headings.length === 0) return;

    const update = () => {
      let best = '';
      let bestTop = Infinity;

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top >= 8 && top < bestTop) {
          bestTop = top;
          best = h.id;
        }
      }

      if (!best) {
        let lastAbove = '';
        let lastAboveTop = -Infinity;
        for (const h of headings) {
          const el = document.getElementById(h.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top < 8 && top > lastAboveTop) {
            lastAboveTop = top;
            lastAbove = h.id;
          }
        }
        if (lastAbove) best = lastAbove;
      }

      if (!best && headings.length > 0) best = headings[0].id;
      if (best && best !== activeRef.current) setActiveId(best);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [headings]);

  if (headings.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <h4 className="text-sm font-semibold text-foreground mb-4">本页目录</h4>
        <p className="text-xs text-muted-foreground/60">无标题，暂无法生成目录</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-semibold text-foreground mb-4">本页目录</h4>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  window.history.pushState({}, '', `#${heading.id}`);
                }}
                className={cn(
                  'block w-full text-left text-sm transition-colors hover:text-foreground text-muted-foreground no-underline',
                  activeId === heading.id && 'text-primary font-medium underline underline-offset-4',
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
