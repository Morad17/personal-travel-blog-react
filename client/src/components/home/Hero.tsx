import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import styles from './Hero.module.scss';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

export default function Hero() {
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg} data-scroll data-scroll-speed="-0.3">
        <div className={styles.bgOverlay} />
        {/* Replace src with your Cloudinary hero video/image URL */}
        <div className={styles.bgPlaceholder} />
      </div>

      {/* Content */}
      <motion.div
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span className={styles.eyebrow} variants={itemVariants}>
          Travel Journal
        </motion.span>

        <motion.h1 className={styles.title} variants={itemVariants}>
          Explore
          <br />
          <em>The World</em>
        </motion.h1>

        <motion.p className={styles.subtitle} variants={itemVariants}>
          Stories, photographs and honest accounts from the road.
          <br />
          No filters. Just the journey.
        </motion.p>

        <motion.div className={styles.ctas} variants={itemVariants}>
          <Link to="/countries" className={styles.btnPrimary}>
            Read Stories
          </Link>
          <Link to="/map" className={styles.btnSecondary}>
            View Map
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        className={styles.scrollBtn}
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-label="Scroll down"
      >
        <ChevronDown size={24} />
      </motion.button>
    </section>
  );
}
