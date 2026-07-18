import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { renderMarkdown } from '@/lib/render-markdown';

export const dynamic = 'force-static';

const POSTS_DIR = join(process.cwd(), 'posts');
const BLOG_URL = 'https://2x.nz/';
const SITE_TITLE = '博客 | 二叉树树';
const SITE_DESC = '专注于IT/互联网技术分享与实践的个人技术博客。';
const AUTHOR_NAME = '二叉树树';
const AUTHOR_EMAIL = 'acofork@qq.com';
const SELF_URL = 'https://2x.nz/rss.xml';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function toRfc822Date(dateStr: string): string {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function parseFrontmatter(fm: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = fm.split('\n');
  let currentKey: string | null = null;
  let currentList: string[] = [];

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      if (currentKey && currentList.length) { result[currentKey] = [...currentList]; currentList = []; }
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '') { currentList = []; }
      else if (val.startsWith('[')) { result[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean); currentKey = null; }
      else { result[currentKey] = val.replace(/^['"]|['"]$/g, ''); currentKey = null; }
      continue;
    }
    const liMatch = line.match(/^\s*-\s+(.*)$/);
    if (liMatch && currentKey) currentList.push(liMatch[1].trim().replace(/^['"]|['"]$/g, ''));
  }
  if (currentKey && currentList.length) result[currentKey] = [...currentList];
  return result;
}

export async function GET() {
  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts: Array<{
    slug: string; title: string; description: string; published: string;
    image: string | null; draft: boolean; hide: boolean; category?: string; tags: string[];
  }> = [];
  const bodyMap: Record<string, string> = {};

  for (const file of files) {
    const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
    const slug = file.replace(/\.md$/, '');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) continue;

    const fm = parseFrontmatter(match[1]);
    bodyMap[slug] = raw.slice(match[0].length);
    if (!fm.title) continue;

    posts.push({
      slug,
      title: String(fm.title),
      description: String(fm.description || ''),
      published: String(fm.date || ''),
      image: fm.coverImage ? String(fm.coverImage) : fm.image ? String(fm.image) : null,
      draft: fm.draft === true || fm.draft === 'true',
      hide: fm.hide === true || fm.hide === 'true',
      category: fm.category ? String(fm.category) : undefined,
      tags: Array.isArray(fm.tags) ? fm.tags.filter((t): t is string => typeof t === 'string') : [],
    });
  }

  // 编译完整 HTML 内容（让 RSS 里包含渲染后的正文）
  for (const post of posts) {
    const raw = bodyMap[post.slug];
    if (raw) {
      const body = raw.replace(/\/img\//g, 'https://raw-posts.2x.nz/img/');
      bodyMap[post.slug] = renderMarkdown(body);
    }
  }

  posts.sort((a, b) => {
    if (a.published && b.published) return b.published.localeCompare(a.published);
    if (a.published) return -1;
    if (b.published) return 1;
    return 0;
  });

  const visible = posts.filter(p => !p.draft && !p.hide);
  const lastBuildDate = visible.length > 0 ? toRfc822Date(visible[0].published) : new Date().toUTCString();

  let r = '<?xml version="1.0" encoding="utf-8"?>\n';
  r += '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n';
  r += '  <channel>\n';
  r += '    <title>' + escapeXml(SITE_TITLE) + '</title>\n';
  r += '    <link>' + escapeXml(BLOG_URL) + '</link>\n';
  r += '    <description>' + escapeXml(SITE_DESC) + '</description>\n';
  r += '    <language>zh-CN</language>\n';
  r += '    <lastBuildDate>' + lastBuildDate + '</lastBuildDate>\n';
  r += '    <generator>svaf-next/blog</generator>\n';
  r += '    <atom:link href="' + escapeXml(SELF_URL) + '" rel="self" type="application/rss+xml"/>\n';
  r += '    <managingEditor>' + escapeXml(AUTHOR_EMAIL) + ' (' + escapeXml(AUTHOR_NAME) + ')</managingEditor>\n';
  r += '    <webMaster>' + escapeXml(AUTHOR_EMAIL) + ' (' + escapeXml(AUTHOR_NAME) + ')</webMaster>\n';

  for (const post of visible) {
    const postUrl = BLOG_URL + 'posts/' + post.slug + '/';
    let fullContent = '';
    if (post.image) fullContent += '<p><img src="' + post.image + '" alt="' + escapeXml(post.title) + '" /></p>';
    if (post.description) fullContent += '<p>' + escapeXml(post.description) + '</p>';
    fullContent += bodyMap[post.slug] || '';

    r += '    <item>\n';
    r += '      <title>' + escapeXml(post.title) + '</title>\n';
    r += '      <link>' + escapeXml(postUrl) + '</link>\n';
    r += '      <guid isPermaLink="true">' + escapeXml(postUrl) + '</guid>\n';
    r += '      <pubDate>' + toRfc822Date(post.published) + '</pubDate>\n';
    if (post.description) r += '      <description>' + escapeXml(post.description) + '</description>\n';
    r += '      <content:encoded><![CDATA[' + fullContent + ']]></content:encoded>\n';
    if (post.image) {
      const ext = (post.image.toLowerCase().match(/\.\w+$/) || [''])[0];
      const mime = MIME_MAP[ext] || 'image/jpeg';
      r += '      <media:content url="' + post.image + '" type="' + mime + '" medium="image" />\n';
      r += '      <media:thumbnail url="' + post.image + '" />\n';
    }
    for (const tag of post.tags) r += '      <category>' + escapeXml(tag) + '</category>\n';
    if (post.category) r += '      <category>' + escapeXml(post.category) + '</category>\n';
    r += '    </item>\n';
  }

  r += '  </channel>\n</rss>\n';

  return new Response(r, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
