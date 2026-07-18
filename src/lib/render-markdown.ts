/**
 * 博客 markdown 渲染器（构建时使用）。
 *
 * 使用 markdown-it + highlight.js 编译文章正文。
 */

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import php from 'highlight.js/lib/languages/php';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import ini from 'highlight.js/lib/languages/ini';
import nginx from 'highlight.js/lib/languages/nginx';
import markdown from 'highlight.js/lib/languages/markdown';

for (const [name, lang] of Object.entries({
  bash, javascript, typescript, python, json, yaml, xml, css, php, rust, sql, dockerfile, ini, nginx, markdown,
})) hljs.registerLanguage(name, lang);

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CALLOUT_TYPES = ['TIP', 'INFO', 'NOTE', 'WARNING', 'CAUTION', 'DANGER', 'IMPORTANT'];

const CALLOUT_TITLES: Record<string, string> = {
  tip: '💡 提示',
  info: 'ℹ️ 信息',
  note: '📝 注意',
  warning: '⚠️ 警告',
  caution: '⚡ 小心',
  danger: '🚫 危险',
  important: '❗ 重要',
};

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: (str: string, lang: string) => {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(str)}</div>`;
    }
    const langName = hljs.getLanguage(lang) ? lang : (hljs.getLanguage('ini') ? 'ini' : '');
    if (langName) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: langName, ignoreIllegals: true }).value}</code></pre>`;
      } catch {}
    }
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`;
  },
});

// Custom callout/admonition renderer for > [!TIP] / > [!WARNING] etc.
let calloutDepth = 0;

const origRender = md.render.bind(md) as typeof md.render;
md.render = function (...args: Parameters<typeof md.render>) {
  calloutDepth = 0;
  return origRender(...args);
};

const origBlockquoteOpen = md.renderer.rules.blockquote_open;
md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
  const next = tokens[idx + 1];
  if (next?.type === 'paragraph_open') {
    const inline = tokens[idx + 2];
    if (inline?.type === 'inline' && inline.content) {
      const m = inline.content.match(/^\[!(\w+)\]\s*/);
      if (m && CALLOUT_TYPES.includes(m[1].toUpperCase())) {
        const type = m[1].toLowerCase();
        if (inline.children?.[0]?.type === 'text') {
          inline.children[0].content = inline.children[0].content.replace(/^\[!\w+\]\s*/, '');
        }
        inline.content = inline.content.replace(/^\[!\w+\]\s*/, '');
        calloutDepth = 1;
        return `<div class="callout callout-${type}"><div class="callout-title">${CALLOUT_TITLES[type] || m[1]}</div>`;
      }
    }
  }
  return origBlockquoteOpen
    ? origBlockquoteOpen(tokens, idx, options, env, self as any)
    : self.renderToken(tokens, idx, options);
};

const origBlockquoteClose = md.renderer.rules.blockquote_close;
md.renderer.rules.blockquote_close = function (tokens, idx, options, env, self) {
  if (calloutDepth) {
    calloutDepth = 0;
    return '</div>';
  }
  return origBlockquoteClose
    ? origBlockquoteClose(tokens, idx, options, env, self as any)
    : self.renderToken(tokens, idx, options);
};

/**
 * 渲染 Markdown 为 HTML，支持代码高亮、callout 引用块、Mermaid。
 * 自动为 h1/h2 添加 id 锚点（用于 TOC）。
 */
export function renderMarkdown(content: string): string {
  const rendered = md.render(content);
  // 给 h1/h2 添加 id 锚点（支持 TOC）
  return rendered.replace(
    /<(h[12])\b([^>]*)>(.*?)<\/\1>/gi,
    (_, tag, attrs, text) => {
      if (/id=/.test(attrs)) return `<${tag}${attrs}>${text}</${tag}>`;
      const id = text
        .replace(/<[^>]+>/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9一-鿿㐀-䶿-]/g, '')
        .replace(/^-+|-+$/g, '');
      return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    },
  );
}
