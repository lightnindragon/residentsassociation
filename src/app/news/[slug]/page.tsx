import Link from "next/link";
import Image from "next/image";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { PostCommentSection } from "./PostCommentSection";
import { normalizeSiteImageUrl } from "@/lib/site-content";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { formatUkDate } from "@/lib/date-format";

export const dynamic = "force-dynamic";

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  type PostRow = {
    id: string;
    title: string;
    slug: string;
    body: string;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
    author_name: string | null;
  };
  type CommentRow = {
    id: string;
    body: string;
    created_at: string;
    display_name: string | null;
  };
  let post: PostRow | null = null;
  let comments: CommentRow[] = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT p.id, p.title, p.slug, p.body, p.cover_image_url, p.published_at, p.created_at, u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      WHERE p.slug = ${slug} AND p.published_at IS NOT NULL AND p.published_at <= NOW()
      LIMIT 1
    `;
    post = (rows[0] as PostRow) ?? null;
    if (post) {
      const cRows = await sql`
        SELECT c.id, c.body, c.created_at::text,
          COALESCE(u.forum_username, u.name) AS display_name
        FROM post_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ${post.id}::uuid
        ORDER BY c.created_at ASC
      `;
      comments = cRows as CommentRow[];
    }
  } catch (err) {
    console.error("Error in NewsPostPage DB fetch:", err);
  }
  if (!post) notFound();

  const session = await auth();
  const user = session?.user as { id?: string; role?: string; approved?: boolean } | undefined;
  const canComment =
    !!user?.id && (user.role === "admin" || user.role === "dev" || user.approved !== false);
  const loginHint = !user?.id
    ? "Sign in to leave a comment."
    : !canComment
      ? "Your account must be approved before you can comment."
      : undefined;

  const safeHtml = sanitizeRichHtml(post.body);
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/news" className="text-sm text-[var(--color-primary)] hover:underline">
        ← News
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-[var(--foreground)]">{post.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {post.published_at
          ? formatUkDate(post.published_at)
          : formatUkDate(post.created_at)}
        {post.author_name && ` · ${post.author_name}`}
      </p>
      
      {post.cover_image_url && (
        <div className="relative mt-8 h-64 w-full overflow-hidden rounded-xl border border-[var(--color-border)] sm:h-[400px]">
          <Image
            src={normalizeSiteImageUrl(post.cover_image_url)}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="rich-content mt-8"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <PostCommentSection
        postId={post.id}
        slug={post.slug}
        title={post.title}
        comments={comments}
        canComment={!!canComment}
        loginHint={loginHint}
      />
      {showDonate && donationSettings && (
        <footer className="mt-12 border-t border-[var(--color-border)] pt-8">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Support the association
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            If you would like to help fund our work in the community, you can donate by bank transfer.
          </p>
          <div className="mt-3">
            <DonateButton
              variant="signature"
              details={{
                bankName: donationSettings.bankName,
                sortCode: donationSettings.sortCode,
                accountNumber: donationSettings.accountNumber,
                accountName: donationSettings.accountName,
              }}
            />
          </div>
        </footer>
      )}
    </article>
  );
}
