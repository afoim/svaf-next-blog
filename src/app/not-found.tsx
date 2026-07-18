import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">页面未找到</p>
      <Link href="/posts" className="text-primary hover:underline">返回博客列表</Link>
    </main>
  );
}
