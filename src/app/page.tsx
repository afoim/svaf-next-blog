import { getVisiblePosts } from '@/lib/content';
import { PostsSearch } from '@/components/PostsSearch';

export default async function PostsPage() {
  const posts = await getVisiblePosts();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">博客</h1>
      <PostsSearch
        posts={posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          published: p.published,
          description: p.description,
          tags: p.tags,
          image: p.image,
          pinned: p.pinned,
          category: p.category,
        }))}
      />
    </main>
  );
}
