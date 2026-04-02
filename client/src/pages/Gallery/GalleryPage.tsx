import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { galleryService } from "../../services/galleryService";
import { countriesService } from "../../services/countriesService";
import styles from "./GalleryPage.module.scss";

export default function GalleryPage() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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
          limit: 100,
        })
        .then((r) => r.data),
  });

  const items = data?.items ?? [];

  const slides = items.map((item) =>
    item.resourceType === "video"
      ? {
          type: "video" as const,
          sources: [{ src: item.secureUrl, type: "video/mp4" }],
          poster: item.thumbnailUrl,
        }
      : { src: item.secureUrl },
  );

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
        ) : (
          <div className={styles.masonry}>
            {items.map((item, i) => (
              <button
                key={item.id}
                className={styles.item}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.caption ?? ""}
                  loading="lazy"
                />
                {item.resourceType === "video" && (
                  <div className={styles.playIcon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                )}
                {item.caption && (
                  <div className={styles.caption}>{item.caption}</div>
                )}
              </button>
            ))}
          </div>
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
