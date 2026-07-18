'use client';

import { useEffect } from 'react';

/**
 * 博客正文渲染（纯展示，HTML 来自服务端构建时编译）。
 */
export function PostBody({ html }: { html: string }) {
  // Mermaid diagram rendering
  useEffect(() => {
    if (!html) return;
    let cancelled = false;
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return;
      mermaid.initialize({ startOnLoad: false });
      requestAnimationFrame(() => {
        try { mermaid.run({ querySelector: '.mermaid' }); } catch {}
      });
    });
    return () => { cancelled = true; };
  }, [html]);

  if (!html) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/6" />
      </div>
    );
  }

  return (
    <div
      className="prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-[#1e1e2e] prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
