'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { NumberTicker } from '@/components/ui/number-ticker';

const VIEWS_API = 'https://t.2x.nz/batch';

export interface PostEntry {
  slug: string;
  title: string;
  published: string;
  description: string;
  tags: string[];
  image?: string | null;
  pinned?: boolean;
  category?: string | null;
}

function highlight(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="rounded-sm bg-amber-200 dark:bg-amber-800 px-0.5">$1</mark>',
  );
}

/** 客户端缓存 views（与 PageViews 共享，避免重复请求） */
const viewsCache = new Map<string, number>();

export function PostsSearch({ posts }: { posts: PostEntry[] }) {
  const [query, setQuery] = useState('');
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // 批量查询所有文章的浏览量
  useEffect(() => {
    const slugs = posts.map((p) => p.slug);
    const uncached = slugs.filter((s) => !viewsCache.has(s));
    if (uncached.length === 0) {
      const map: Record<string, number> = {};
      for (const slug of slugs) {
        const v = viewsCache.get(slug);
        if (v !== undefined) map[slug] = v;
      }
      setViewsMap(map);
      return;
    }

    const pathnames = uncached.map((s) => `/posts/${s}/`);
    fetch(VIEWS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(pathnames),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: number[] | null) => {
        if (!data) return;
        const map: Record<string, number> = {};
        for (const slug of slugs) {
          const v = viewsCache.get(slug);
          if (v !== undefined) {
            map[slug] = v;
          }
        }
        uncached.forEach((slug, i) => {
          if (data[i] != null) {
            viewsCache.set(slug, data[i]);
            map[slug] = data[i];
          }
        });
        setViewsMap(map);
      })
      .catch(() => {});
  }, [posts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return [];

    const scored = posts
      .map((post) => {
        const title = post.title.toLowerCase();
        const desc = post.description.toLowerCase();
        const tags = post.tags.join(' ').toLowerCase();

        let matches = 0;
        for (const kw of keywords) {
          const inTitle = (title.match(new RegExp(kw, 'g')) || []).length;
          const inDesc = (desc.match(new RegExp(kw, 'g')) || []).length;
          const inTags = (tags.match(new RegExp(kw, 'g')) || []).length;
          matches += inTitle * 5 + inDesc * 3 + inTags * 2;
        }

        return { ...post, score: matches };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored;
  }, [query, posts]);

  const isSearching = query.trim().length > 0;

  const sorted = useMemo(
    () =>
      [...posts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      }),
    [posts],
  );

  return (
    <>
      <div className="relative mb-8">
        <Icon
          icon="mdi:magnify"
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章… (Cmd+K)"
          className="w-full h-10 pl-9 pr-4 rounded-lg border bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {isSearching && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon="mdi:close" className="size-4" />
          </button>
        )}
      </div>

      {isSearching ? (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            找到 {results?.length ?? 0} 篇文章
          </p>
          {results && results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">没有找到匹配的文章</p>
          ) : (
            <div className="flex flex-col gap-4">
              {results?.map((post) => (
                <PostCard key={post.slug} post={post} query={query} showScore views={viewsMap[post.slug]} />
              ))}
            </div>
          )}
        </>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">暂无文章</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <PostCardGrid key={post.slug} post={post} views={viewsMap[post.slug]} />
          ))}
        </div>
      )}
    </>
  );
}

function PostCardGrid({ post, views }: { post: PostEntry; views?: number }) {
  return (
    <a
      href={`/posts/${post.slug}/`}
      className="group block rounded-lg border p-3 sm:p-5 hover:border-primary/50 hover:shadow-sm transition-all h-full"
    >
      <article className="flex flex-col gap-3">
        {post.image && (
          <div className="-mx-3 -mt-3 sm:-mx-5 sm:-mt-5 mb-1 overflow-hidden rounded-t-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap leading-none">
            {post.pinned && (
              <>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Icon icon="mdi:pin" className="size-3" />
                  置顶
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon="mdi:calendar" className="size-3" />
              <time dateTime={post.published}>{post.published.slice(0, 10)}</time>
            </span>
            {post.category && (
              <>
                <span aria-hidden>·</span>
                <span className="text-xs text-muted-foreground">{post.category}</span>
              </>
            )}
            {views !== undefined && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <NumberTicker value={views} />
                </span>
              </>
            )}
            {post.tags.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate text-xs text-muted-foreground">{post.tags.join(' / ')}</span>
              </>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors leading-snug">{post.title}</h2>

          {post.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{post.description}</p>
          )}
        </div>
      </article>
    </a>
  );
}

function PostCard({
  post,
  query,
  showScore,
  views,
}: {
  post: PostEntry & { score?: number };
  query?: string;
  showScore?: boolean;
  views?: number;
}) {
  return (
    <a
      href={`/posts/${post.slug}/`}
      className="group block rounded-lg border p-3 sm:p-5 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <article className="flex gap-4 items-center">
        {post.image && (
          <div className="shrink-0 self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              className="h-20 w-28 sm:h-24 sm:w-36 rounded-md object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap leading-none">
            {post.pinned && (
              <>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Icon icon="mdi:pin" className="size-3" />
                  置顶
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon="mdi:calendar" className="size-3" />
              <time dateTime={post.published}>{post.published.slice(0, 10)}</time>
            </span>
            {post.category && (
              <>
                <span aria-hidden>·</span>
                <span className="text-xs text-muted-foreground">{post.category}</span>
              </>
            )}
            {views !== undefined && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <NumberTicker value={views} />
                </span>
              </>
            )}
            {post.tags.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate text-xs text-muted-foreground">{post.tags.join(' / ')}</span>
              </>
            )}
          </div>

          <h2
            className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors leading-snug"
            dangerouslySetInnerHTML={{
              __html: showScore && query ? highlight(post.title, query) : post.title,
            }}
          />

          {post.description && (
            <p
              className="mt-1 text-sm text-muted-foreground line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: showScore && query ? highlight(post.description, query) : post.description,
              }}
            />
          )}
        </div>

        {showScore && post.score != null && (
          <span className="shrink-0 self-start text-xs tabular-nums text-muted-foreground/60 pt-1">
            {post.score} 匹配
          </span>
        )}
      </article>
    </a>
  );
}
