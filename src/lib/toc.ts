export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * 从预编译的 HTML 中提取 h1/h2 标题列表（构建时调用）。
 */
export function extractHeadings(html: string): Heading[] {
  const result: Heading[] = [];
  const regex = /<h([12])\b[^>]*?id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    if (id && text) {
      result.push({ id, text, level });
    }
  }
  return result;
}
