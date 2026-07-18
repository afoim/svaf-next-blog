import type { Metadata } from 'next';
import { fetchPost, getAllSlugs } from '@/lib/content';
import { PostBody } from '@/components/PostBody';
import { PageViews } from '@/components/PageViews';
import { Giscus } from '@/components/Giscus';
import { TableOfContents } from '@/components/TableOfContents';
import { MobileTableOfContents } from '@/components/MobileTableOfContents';

const SITE_URL = 'https://2x.nz';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: '文章未找到' };

  const url = `${SITE_URL}/posts/${slug}/`;
  const tags = post.tags.length > 0 ? [...post.tags] : undefined;
  if (post.category) tags?.push(post.category);

  return {
    title: post.title,
    description: post.description || undefined,
    keywords: tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description || undefined,
      url,
      images: post.image ? [{ url: post.image }] : undefined,
      publishedTime: post.published || undefined,
      tags: post.tags.length > 0 ? post.tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || undefined,
      images: post.image ? [post.image] : undefined,
    },
  };
}

function viewBoxIcon(d: string, viewBox = "0 0 24 24") {
  return (
    <span className="inline-flex items-center justify-center shrink-0 leading-none size-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-full block">
        <path d={d}/>
      </svg>
    </span>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-8">文章未找到</p>
        <a href="/posts" className="text-primary hover:underline">返回博客列表</a>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-8 relative">
        <article className="flex-1 min-w-0 max-w-2xl mx-auto xl:mx-0 xl:max-w-none">
          <a
            href="/posts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <span className="inline-flex items-center justify-center shrink-0 leading-none size-4">{viewBoxIcon("m12 19-7-7 7-7M19 12H5")}</span>
            返回博客列表
          </a>

          <header className="mb-8">
            {post.pinned && (
              <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
                <span className="inline-flex items-center justify-center shrink-0 leading-none size-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-full block"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                </span>
                置顶
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            {post.description && (
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">{post.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground flex-wrap leading-none">
              <span className="inline-flex items-center gap-1">
                <span className="inline-flex items-center justify-center shrink-0 leading-none size-3">{viewBoxIcon("M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z", "0 0 24 24")}</span>
                <time dateTime={post.published}>{post.published.slice(0, 10)}</time>
              </span>
              <span aria-hidden>·</span>
              <PageViews pathname={`/posts/${slug}/`} className="inline-flex items-center gap-1" />
              {post.category && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.category}</span>
                </>
              )}
              {post.tags.length > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <div className="flex gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </>
              )}
              {post.ai_level && (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-xs text-muted-foreground/60">
                    AI 辅助 · {post.ai_level === 1 ? '轻度' : '深度'}
                  </span>
                </>
              )}
            </div>
            {post.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.image} alt={post.title} className="mt-6 w-full rounded-lg object-cover aspect-video" />
            )}
          </header>

          <PostBody html={post.html} />

          {/* JSON-LD structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.description || undefined,
                image: post.image || undefined,
                datePublished: post.published || undefined,
                author: {
                  '@type': 'Person',
                  name: '二叉树树',
                  url: 'https://2x.nz/',
                },
                publisher: {
                  '@type': 'Person',
                  name: '二叉树树',
                },
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `${SITE_URL}/posts/${slug}/`,
                },
                keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
              }),
            }}
          />

          <Giscus />
        </article>

        <aside className="hidden xl:block w-[350px] flex-shrink-0 p-6 bg-muted/60 dark:bg-muted/20 rounded-lg">
          <div className="sticky top-20 space-y-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <TableOfContents />
            </div>
          </div>
        </aside>
      </div>
      <MobileTableOfContents />
    </main>
  );
}
