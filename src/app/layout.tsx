import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '@/styles/hljs.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer, Analytics, CookieConsent } from '@svaf/shared';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://2x.nz';
const SITE_NAME = '博客 | 二叉树树';
const SITE_DESC = '专注于IT/互联网技术分享与实践的个人技术博客。';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | 二叉树树`,
  },
  description: SITE_DESC,
  keywords: ['博客', '二叉树树', '技术博客', 'IT', '互联网', '前端', '后端', 'DevOps', 'Cloudflare'],
  icons: {
    icon: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0',
  },
  openGraph: {
    type: 'website',
    siteName: '二叉树树',
    locale: 'zh_CN',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESC,
    images: [{ url: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESC,
    images: ['https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0'],
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh_CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Header />
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
