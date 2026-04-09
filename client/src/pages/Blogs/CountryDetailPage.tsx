import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { countriesService } from "../../services/countriesService";
import PostCard from "../../components/blog/PostCard";
import { formatDateUK } from "../../utils/formatDate";
import styles from "./CountryDetailPage.module.scss";

export default function CountryDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["country", slug],
    queryFn: () => countriesService.getBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={`skeleton ${styles.skeletonHero}`} />
      </div>
    );
  }

  if (!data) return <div className={styles.notFound}>Country not found</div>;

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        {data.coverImageUrl && (
          <img
            src={data.coverImageUrl}
            alt={data.name}
            className={styles.heroImage}
          />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.flag}>{data.flagEmoji}</span>
          <h1 className={styles.name}>{data.name}</h1>
          {data.visits?.length > 0 && (
            <ul className={styles.visitsList}>
              {data.visits.map((v) => (
                <li key={v.id}>
                  <strong>{formatDateUK(v.date)}</strong>
                  {v.cities.length > 0 && ` — ${v.cities.join(", ")}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/blogs" className={styles.breadcrumbLink}>
            Countries
          </Link>
          <span className={styles.sep}>›</span>
          <span>{data.name}</span>
        </div>

        <h2 className={styles.sectionTitle}>
          {data.posts.length} {data.posts.length === 1 ? "Story" : "Stories"}
        </h2>

        {data.posts.length > 0 ? (
          <div className={styles.grid}>
            {data.posts.map((post) => (
              <PostCard key={post.id} post={{ ...post, country: data }} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No stories yet for this country.</p>
        )}
      </div>
    </main>
  );
}
