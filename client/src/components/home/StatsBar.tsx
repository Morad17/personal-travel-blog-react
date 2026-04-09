import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { countriesService } from '../../services/countriesService';
import { galleryService } from '../../services/galleryService';
import styles from './StatsBar.module.scss';

function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}</span>;
}

export default function StatsBar() {
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const { data: galleryData } = useQuery({
    queryKey: ['gallery-count'],
    queryFn: () => galleryService.getAll({ limit: 1, type: 'image' }).then((r) => r.data),
  });

  const totalPosts = countries?.reduce((sum, c) => sum + (c._count?.posts ?? 0), 0) ?? 0;
  const countriesCount = countries?.length ?? 0;
  const photoCount = galleryData?.total ?? 0;

  const stats = [
    { value: countriesCount, label: 'Countries', suffix: '' },
    { value: totalPosts, label: 'Stories', suffix: '' },
    { value: photoCount, label: 'Photos', suffix: '+' },
  ];

  return (
    <section className={styles.statsBar}>
      <div className={styles.inner}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.stat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
          >
            <span className={styles.value}>
              <AnimatedCount target={stat.value} />
              {stat.suffix}
            </span>
            <span className={styles.label}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
