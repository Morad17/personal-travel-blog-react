import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useState } from "react";
import { postsService } from "../../services/postsService";
import { formatDate } from "../../utils/formatDate";
import styles from "./PostDetailPage.module.scss";

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsService.getBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={`skeleton ${styles.skeletonHero}`} />
        <div className={styles.skeletonContent}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonLine}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) return <div className={styles.notFound}>Post not found</div>;

  const imageItems =
    post.mediaItems?.filter((m) => m.resourceType === "image") ?? [];
  const slides = imageItems.map((m) => ({ src: m.secureUrl }));

  return (
    <article className={styles.article}>
      {post.coverImageUrl && (
        <div className={styles.hero}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>
      )}

      <div className={styles.content}>
        <header className={styles.header}>
          <Link
            to={`/countries/${post.country.slug}`}
            className={styles.countryLink}
          >
            <span className={styles.flag}>{post.country.flagEmoji}</span>
            {post.country.name}
          </Link>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <time>{formatDate(post.createdAt)}</time>
            <span className={styles.dot}>·</span>
            <span>{post.readTime} min read</span>
          </div>
          {post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className={`prose ${styles.body}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {imageItems.length > 0 && (
          <section className={styles.gallery}>
            <h3 className={styles.galleryTitle}>Photos</h3>
            <div className={styles.galleryGrid}>
              {imageItems.map((item, i) => (
                <button
                  key={item.id}
                  className={styles.galleryItem}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                >
                  <img src={item.secureUrl} alt={item.caption ?? ""} />
                </button>
              ))}
            </div>
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              slides={slides}
              index={lightboxIndex}
            />
          </section>
        )}
      </div>
    </article>
  );
}
