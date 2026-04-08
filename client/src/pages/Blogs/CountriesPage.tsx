import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsService } from "../../services/postsService";
import { countriesService } from "../../services/countriesService";
import PostCard from "../../components/blog/PostCard";
import styles from "./CountriesPage.module.scss";

export default function CountriesPage() {
  const [countryFilter, setCountryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: countriesList } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["posts", { country: countryFilter, page }],
    queryFn: () =>
      postsService
        .getAll({ country: countryFilter || undefined, page, limit: 9 })
        .then((r) => r.data),
  });

  const filtered = data?.posts?.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.label}>Explore</span>
          <h1 className={styles.title}>Travel Stories</h1>
          <p className={styles.subtitle}>
            Adventures, encounters and moments from around the world
          </p>
        </header>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className={styles.select}
          >
            <option value="">All Countries</option>
            {countriesList?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.flagEmoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {filtered?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {data && data.total > data.limit && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.pageBtn}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {Math.ceil(data.total / data.limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / data.limit)}
                  className={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
