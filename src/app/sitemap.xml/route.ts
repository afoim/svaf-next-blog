import { getVisiblePosts } from '@/lib/content';

const SITE_URL = 'https://2x.nz';

export const dynamic = 'force-static';

export async function GET() {
  const posts = await getVisiblePosts();

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 列表页
  xml += `  <url><loc>${SITE_URL}/posts/</loc><priority>0.8</priority></url>\n`;

  for (const post of posts) {
    const url = `${SITE_URL}/posts/${post.slug}/`;
    // 发布日期作为 lastmod 近似值，搜索引擎偏好较新的内容
    const lastmod = post.published ? new Date(post.published).toISOString().split('T')[0] : undefined;
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
