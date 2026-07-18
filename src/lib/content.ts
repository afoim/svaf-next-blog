/**
 * 博客内容层 —— 构建时从本地 posts/*.md 读取并编译。
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { renderMarkdown } from './render-markdown';

const POSTS_DIR = join(process.cwd(), 'posts');
const IMG_DOMAIN = 'https://raw-posts.2x.nz';

function absUrl(url: unknown): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return IMG_DOMAIN + (url.startsWith('/') ? url : '/' + url);
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  published: string;
  image: string | null;
  pinned: boolean;
  draft: boolean;
  hide: boolean;
  tags: string[];
  category?: string;
  lang?: string;
  ai_level?: number;
}

export interface Post extends PostMeta {
  html: string;
  content: string;
}

/** 解析 frontmatter（轻量 YAML parse，不依赖 gray-matter）*/
function parseFrontmatter(raw: string): Record<string, unknown> {
  const fm: Record<string, unknown> = {};
  const lines = raw.split('\n');
  let currentKey: string | null = null;
  let currentList: string[] = [];

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      if (currentKey && currentList.length) {
        fm[currentKey] = [...currentList];
        currentList = [];
      }
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '') {
        currentList = [];
      } else if (val.startsWith('[')) {
        fm[currentKey] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        currentKey = null;
      } else {
        fm[currentKey] = val.replace(/^['"]|['"]$/g, '');
        currentKey = null;
      }
      continue;
    }
    const liMatch = line.match(/^\s*-\s+(.*)$/);
    if (liMatch && currentKey) {
      currentList.push(liMatch[1].trim().replace(/^['"]|['"]$/g, ''));
    }
  }
  if (currentKey && currentList.length) {
    fm[currentKey] = [...currentList];
  }
  return fm;
}

let cachedIndex: PostMeta[] | null = null;

/**
 * 扫描本地 posts/ 目录，解析所有 .md 文件的 frontmatter。
 */
function scanLocalPosts(): PostMeta[] {
  if (cachedIndex) return cachedIndex;

  const dir = POSTS_DIR;
  if (!existsSync(dir)) {
    console.warn(`[content] 目录不存在: ${dir}`);
    return [];
  }

  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const slug = file.replace(/\.md$/, '');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) continue;

    const fm = parseFrontmatter(match[1]);
    if (!fm.title) continue;

    posts.push({
      slug,
      title: String(fm.title),
      description: String(fm.description || ''),
      published: String(fm.date || ''),
      image: absUrl(fm.coverImage) || absUrl(fm.image),
      pinned: fm.pin === true || fm.pin === 'true',
      draft: fm.draft === true || fm.draft === 'true',
      hide: fm.hide === true || fm.hide === 'true',
      tags: Array.isArray(fm.tags) ? fm.tags.filter((t): t is string => typeof t === 'string') : [],
      category: fm.category ? String(fm.category) : undefined,
      lang: fm.lang ? String(fm.lang) : undefined,
      ai_level: typeof fm.ai_level === 'number' ? fm.ai_level : undefined,
    });
  }

  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.published && b.published) return b.published.localeCompare(a.published);
    if (a.published) return -1;
    if (b.published) return 1;
    return 0;
  });

  cachedIndex = posts;
  return posts;
}

/**
 * 获取所有文章元数据列表
 */
export async function fetchPostsIndex(): Promise<PostMeta[]> {
  return scanLocalPosts();
}

/**
 * 根据 slug 获取单篇文章
 */
export async function fetchPost(slug: string): Promise<Post | null> {
  const file = join(POSTS_DIR, `${slug}.md`);
  if (!existsSync(file)) return null;

  const raw = readFileSync(file, 'utf-8');
  return parseMarkdownPost(slug, raw);
}

function parseMarkdownPost(slug: string, raw: string): Post {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const fm = match ? parseFrontmatter(match[1]) : {};
  const markdownBody = match ? raw.slice(match[0].length) : raw;

  // 将相对路径 /img/ 转为绝对路径
  const body = markdownBody.replace(/\/img\//g, IMG_DOMAIN + '/img/');

  const html = renderMarkdown(body);

  return {
    slug,
    title: fm.title ? String(fm.title) : slug,
    description: String(fm.description || ''),
    published: String(fm.date || ''),
    image: absUrl(fm.coverImage) || absUrl(fm.image),
    pinned: fm.pin === true || fm.pin === 'true',
    draft: fm.draft === true || fm.draft === 'true',
    hide: fm.hide === true || fm.hide === 'true',
    tags: Array.isArray(fm.tags) ? fm.tags.filter((t): t is string => typeof t === 'string') : [],
    category: fm.category ? String(fm.category) : undefined,
    lang: fm.lang ? String(fm.lang) : undefined,
    ai_level: typeof fm.ai_level === 'number' ? fm.ai_level : undefined,
    html,
    content: markdownBody,
  };
}

/** 获取所有可见文章 */
export async function getVisiblePosts(): Promise<PostMeta[]> {
  return scanLocalPosts().filter((p) => !p.draft && !p.hide);
}

/** 获取所有可见 slug */
export async function getAllSlugs(): Promise<string[]> {
  return scanLocalPosts().filter((p) => !p.draft && !p.hide).map((p) => p.slug);
}
