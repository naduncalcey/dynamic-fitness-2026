import Link from "next/link";
import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import type { BlogPostCard as BlogPostCardType } from "@/lib/contentful/blog/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Deterministic UTC date format (avoids server/client locale + timezone drift). */
export function formatBlogDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function BlogPostCard({ post }: { post: BlogPostCardType }) {
  const href = `/blog/${(post.slug ?? "").replace(/^\/+/, "")}`;
  const date = formatBlogDate(post.publishedDate);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
        {post.coverImage ? (
          <ResponsiveImage
            image={post.coverImage}
            imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {post.category ? (
          <span className="mb-3 w-fit rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-red-400">
            {post.category}
          </span>
        ) : null}
        <h3 className="text-lg font-medium leading-snug text-white transition-colors group-hover:text-white">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">{post.excerpt}</p>
        ) : null}
        <div className="mt-4 flex items-center gap-2 pt-2 text-xs text-white/40">
          {post.author?.name ? <span>{post.author.name}</span> : null}
          {post.author?.name && date ? <span aria-hidden>·</span> : null}
          {date ? <span>{date}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default BlogPostCard;
