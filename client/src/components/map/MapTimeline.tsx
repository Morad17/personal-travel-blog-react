import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import type { MapCountry } from "../../types";
import { formatDateOrdinal } from "../../utils/formatDate";
import styles from "./MapTimeline.module.scss";

interface TimelineEntry {
  date: string;
  cities: string[];
  country: MapCountry;
}

export default function MapTimeline() {
  const { data: countries } = useQuery({
    queryKey: ["map-visited"],
    queryFn: () => mapService.getVisited().then((r) => r.data),
  });

  if (!countries?.length) return null;

  const entries: TimelineEntry[] = countries
    .flatMap((c) => c.visits.map((v) => ({ ...v, country: c })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const byYear = entries.reduce<Record<number, TimelineEntry[]>>((acc, e) => {
    const yr = new Date(e.date).getFullYear();
    (acc[yr] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className={styles.timeline}>
      {Object.entries(byYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, items]) => (
        <div key={year} className={styles.yearGroup}>
          <div className={styles.year}>{year}</div>
          {items.map((e, i) => (
            <div key={i} className={styles.entry}>
              <span className={styles.dot} />
              <div className={styles.content}>
                <div className={styles.date}>{formatDateOrdinal(e.date)}</div>
                <div className={styles.country}>
                  <img
                    src={`https://flagcdn.com/w20/${e.country.isoCode.toLowerCase()}.png`}
                    width="16"
                    height="12"
                    alt={e.country.name}
                    className={styles.flag}
                  />
                  {e.country.name}
                </div>
                {e.cities.length > 0 && (
                  <div className={styles.cities}>📍 {e.cities.join(", ")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
