import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import ReactCountryFlag from "react-country-flag";
import { galleryService } from "../../services/galleryService";
import { countriesService } from "../../services/countriesService";
import type { GalleryItem } from "../../types";
import styles from "./GalleryPage.module.scss";

function MasonryGrid({
  items,
  numCols,
  onItemClick,
}: {
  items: GalleryItem[];
  numCols: number;
  onItemClick: (e: React.MouseEvent<HTMLButtonElement>, item: GalleryItem) => void;
}) {
  const columns = Array.from({ length: numCols }, (_, ci) =>
    items.filter((_, i) => i % numCols === ci)
  );

  return (
    <div className={styles.columns}>
      {columns.map((col, ci) => (
        <div key={ci} className={styles.column}>
          {col.map((item) => (
            <button
              key={item.id}
              className={styles.item}
              onClick={(e) => onItemClick(e, item)}
            >
              <img
                src={item.thumbnailUrl}
                alt={item.caption ?? ""}
                loading="lazy"
              />
              {item.resourceType === "video" && (
                <div className={styles.playIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              )}
              {(item.takenAt || item.location || item.country?.isoCode || item.caption) && (
                <div className={styles.meta}>
                  {(item.takenAt || item.location || item.country?.isoCode) && (
                    <div className={styles.metaRow}>
                      {item.country?.isoCode && (
                        <ReactCountryFlag
                          countryCode={item.country.isoCode}
                          svg
                          className={styles.metaFlag}
                        />
                      )}
                      <span className={styles.metaText}>
                        {[
                          item.location,
                          item.takenAt
                            ? new Date(item.takenAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  )}
                  {item.caption && (
                    <span className={styles.metaCaption}>{item.caption}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [numCols, setNumCols] = useState(2);

  useEffect(() => {
    const update = () =>
      setNumCols(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["gallery", { country: countryFilter, type: typeFilter }],
    queryFn: () =>
      galleryService
        .getAll({
          country: countryFilter || undefined,
          type: typeFilter || undefined,
          limit: 200,
        })
        .then((r) => r.data),
  });

  const items = data?.items ?? [];

  const countryGroups = useMemo(() => {
    if (countryFilter) return null;

    const groupMap = new Map<
      string,
      { key: string; name: string; isoCode: string; items: GalleryItem[]; latestDate: number }
    >();

    for (const item of items) {
      const key = item.countryId ?? "__none__";
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          name: item.country?.name ?? "Other",
          isoCode: item.country?.isoCode ?? "",
          items: [],
          latestDate: 0,
        });
      }
      const group = groupMap.get(key)!;
      group.items.push(item);
      const d = item.takenAt ? new Date(item.takenAt).getTime() : 0;
      if (d > group.latestDate) group.latestDate = d;
    }

    return [...groupMap.values()].sort((a, b) => b.latestDate - a.latestDate);
  }, [items, countryFilter]);

  const slides = items.map((item) =>
    item.resourceType === "video"
      ? {
          type: "video" as const,
          sources: [{ src: item.secureUrl, type: "video/mp4" }],
          poster: item.thumbnailUrl,
        }
      : { src: item.secureUrl },
  );

  function handleItemClick(_e: React.MouseEvent<HTMLButtonElement>, item: GalleryItem) {
    const i = items.indexOf(item);
    setIndex(i !== -1 ? i : 0);
    setOpen(true);
  }

  function formatDateRange(groupItems: GalleryItem[]) {
    const dates = groupItems
      .map((i) => (i.takenAt ? new Date(i.takenAt).getTime() : null))
      .filter((d): d is number => d !== null);
    if (!dates.length) return null;
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    return fmt(min) === fmt(max) ? fmt(max) : `${fmt(min)} – ${fmt(max)}`;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.label}>Visual Journal</span>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.subtitle}>
            Photographs and moments captured along the way
          </p>
        </header>

        <div className={styles.filters}>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">All Countries</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.flagEmoji} {c.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">All Media</option>
            <option value="image">Photos</option>
            <option value="video">Videos</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.masonry}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`skeleton ${styles.skeletonItem}`}
                style={{ height: `${200 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        ) : countryGroups ? (
          <div className={styles.groupedLayout}>
            {countryGroups.map((group) => (
              <section key={group.key} className={styles.countrySection}>
                <div className={styles.countryHeader}>
                  {group.isoCode && (
                    <ReactCountryFlag
                      countryCode={group.isoCode}
                      svg
                      className={styles.countryFlag}
                    />
                  )}
                  <h2 className={styles.countryName}>{group.name}</h2>
                  {formatDateRange(group.items) && (
                    <span className={styles.countryDateRange}>
                      {formatDateRange(group.items)}
                    </span>
                  )}
                </div>
                <div className={styles.countryGrid}>
                  <MasonryGrid
                    items={group.items}
                    numCols={numCols}
                    onItemClick={handleItemClick}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <MasonryGrid
            items={items}
            numCols={numCols}
            onItemClick={handleItemClick}
          />
        )}

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={slides}
          index={index}
          plugins={[Video]}
        />
      </div>
    </main>
  );
}
