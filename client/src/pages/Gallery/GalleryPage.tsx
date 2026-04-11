import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import ReactCountryFlag from "react-country-flag";
import { galleryService } from "../../services/galleryService";
import type { GalleryItem } from "../../types";
import styles from "./GalleryPage.module.scss";

// Seconds per item — keeps scroll speed consistent regardless of how many photos are loaded
const SECS_PER_ITEM = 6;
const COL_SPEED_MULTIPLIERS = [1.7, 1.45, 1.58, 1.35];

function GalleryItemCard({
  item,
  onItemClick,
}: {
  item: GalleryItem;
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    item: GalleryItem,
  ) => void;
}) {
  return (
    <button className={styles.item} onClick={(e) => onItemClick(e, item)}>
      <img src={item.thumbnailUrl} alt={item.caption ?? ""} loading="lazy" />
      {item.resourceType === "video" && (
        <div className={styles.playIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      )}
      {(item.takenAt ||
        item.location ||
        item.country?.isoCode ||
        item.caption) && (
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
                    ? new Date(item.takenAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })
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
  );
}

function StaticGrid({
  items,
  numCols,
  onItemClick,
}: {
  items: GalleryItem[];
  numCols: number;
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    item: GalleryItem,
  ) => void;
}) {
  const columns = Array.from({ length: numCols }, (_, ci) =>
    items.filter((_, i) => i % numCols === ci),
  );
  return (
    <div className={styles.staticColumns}>
      {columns.map((col, ci) => (
        <div key={ci} className={styles.staticColumn}>
          {col.map((item) => (
            <GalleryItemCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MasonryGrid({
  items,
  numCols,
  onItemClick,
}: {
  items: GalleryItem[];
  numCols: number;
  onItemClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    item: GalleryItem,
  ) => void;
}) {
  const columns = Array.from({ length: numCols }, (_, ci) =>
    items.filter((_, i) => i % numCols === ci),
  );
  return (
    <div className={styles.columns}>
      {columns.map((col, ci) => {
        const isReverse = ci % 2 !== 0;
        const loopedCol = [...col, ...col];
        return (
          <div key={ci} className={styles.column}>
            <div
              className={`${styles.columnTrack} ${isReverse ? styles.trackDown : styles.trackUp}`}
              style={{
                animationDuration: `${col.length * SECS_PER_ITEM * (COL_SPEED_MULTIPLIERS[ci] ?? 1)}s`,
              }}
            >
              {loopedCol.map((item, idx) => (
                <GalleryItemCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type PickerItem =
  | { kind: "world" }
  | { kind: "country"; slug: string; isoCode: string; name: string };

export default function GalleryPage() {
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [countryFilter, setCountryFilter] = useState("");
  const [numCols, setNumCols] = useState(2);
  const [moving, setMoving] = useState(true);
  const flagRowRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const update = () =>
      setNumCols(
        window.innerWidth >= 1024
          ? 4
          : window.innerWidth >= 768
            ? 3
            : window.innerWidth >= 480
              ? 2
              : 1,
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Stable unfiltered query — used only to build the picker so order never changes
  const { data: allData } = useQuery({
    queryKey: ["gallery-picker"],
    queryFn: () => galleryService.getAll({ limit: 200 }).then((r) => r.data),
    staleTime: Infinity,
  });

  // Filtered query — drives the actual gallery
  const { data, isLoading } = useQuery({
    queryKey: ["gallery", { country: countryFilter }],
    queryFn: () =>
      galleryService
        .getAll({ country: countryFilter || undefined, limit: 200 })
        .then((r) => r.data),
  });

  const items = data?.items ?? [];

  // Build stable picker list from unfiltered data
  const pickerItems = useMemo((): PickerItem[] => {
    const allItems = allData?.items ?? [];
    const seen = new Map<
      string,
      { slug: string; isoCode: string; name: string; latest: number }
    >();
    for (const item of allItems) {
      if (!item.country) continue;
      const { slug, isoCode, name } = item.country;
      const d = item.takenAt ? new Date(item.takenAt).getTime() : 0;
      if (!seen.has(slug) || d > seen.get(slug)!.latest) {
        seen.set(slug, { slug, isoCode, name, latest: d });
      }
    }
    const countries = [...seen.values()].sort((a, b) => b.latest - a.latest);
    const mid = Math.ceil(countries.length / 2);
    return [
      ...countries
        .slice(0, mid)
        .map((c) => ({ kind: "country" as const, ...c })),
      { kind: "world" as const },
      ...countries.slice(mid).map((c) => ({ kind: "country" as const, ...c })),
    ];
  }, [allData]);

  const activeIndex = pickerItems.findIndex((p) =>
    p.kind === "world"
      ? !countryFilter
      : p.kind === "country" && p.slug === countryFilter,
  );

  const selectedCountry =
    pickerItems.find(
      (p): p is Extract<PickerItem, { kind: "country" }> =>
        p.kind === "country" && p.slug === countryFilter,
    ) ?? null;

  // Scroll active button into view whenever activeIndex changes
  useEffect(() => {
    btnRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  function navigate(dir: "left" | "right") {
    const next = dir === "left" ? activeIndex - 1 : activeIndex + 1;
    const clamped = Math.max(0, Math.min(pickerItems.length - 1, next));
    const item = pickerItems[clamped];
    setCountryFilter(item.kind === "world" ? "" : item.slug);
  }

  const slides = items.map((item) =>
    item.resourceType === "video"
      ? {
          type: "video" as const,
          sources: [{ src: item.secureUrl, type: "video/mp4" }],
          poster: item.thumbnailUrl,
        }
      : { src: item.secureUrl },
  );

  function handleItemClick(
    _e: React.MouseEvent<HTMLButtonElement>,
    item: GalleryItem,
  ) {
    const i = items.indexOf(item);
    setLightboxIndex(i !== -1 ? i : 0);
    setOpen(true);
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

        {/* Flag picker */}
        <div className={styles.flagPicker}>
          <button
            className={styles.flagArrow}
            onClick={() => navigate("left")}
            disabled={activeIndex <= 0}
            aria-label="Previous country"
          >
            ‹
          </button>
          <div className={styles.flagRow} ref={flagRowRef}>
            {pickerItems.map((p, i) =>
              p.kind === "world" ? (
                <button
                  key="world"
                  ref={(el) => {
                    btnRefs.current[i] = el;
                  }}
                  className={`${styles.flagBtn} ${!countryFilter ? styles.flagBtnActive : ""}`}
                  onClick={() => setCountryFilter("")}
                  aria-label="All countries"
                >
                  🌍
                </button>
              ) : (
                <button
                  key={p.slug}
                  ref={(el) => {
                    btnRefs.current[i] = el;
                  }}
                  className={`${styles.flagBtn} ${countryFilter === p.slug ? styles.flagBtnActive : ""}`}
                  onClick={() => setCountryFilter(p.slug)}
                  aria-label={p.name}
                >
                  <ReactCountryFlag
                    countryCode={p.isoCode}
                    svg
                    className={styles.pickerFlag}
                  />
                </button>
              ),
            )}
          </div>
          <button
            className={styles.flagArrow}
            onClick={() => navigate("right")}
            disabled={activeIndex >= pickerItems.length - 1}
            aria-label="Next country"
          >
            ›
          </button>
        </div>

        {/* Country title + moving toggle */}
        <div className={styles.titleRow}>
          <div className={styles.countryTitle}>
            {selectedCountry ? selectedCountry.name : "All Countries"}
          </div>
          <div className={styles.movingToggle}>
            <span className={styles.movingLabel}>Moving Images</span>
            <button
              className={`${styles.toggleBtn} ${moving ? styles.toggleBtnOn : ""}`}
              onClick={() => setMoving((v) => !v)}
              aria-label="Toggle moving images"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
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
        ) : moving ? (
          <MasonryGrid
            items={items}
            numCols={numCols}
            onItemClick={handleItemClick}
          />
        ) : (
          <StaticGrid
            items={items}
            numCols={numCols}
            onItemClick={handleItemClick}
          />
        )}

        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={slides}
          index={lightboxIndex}
          plugins={[Video]}
        />
      </div>
    </main>
  );
}
