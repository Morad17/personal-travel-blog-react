import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { formatDateShort } from '../../utils/formatDate';
import styles from './PostCard.module.scss';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  return (
    <Link
      to={`/countries/${post.country.slug}/${post.slug}`}
      className={styles.card}
    >
      <div className={styles.imageWrap}>
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <div className={styles.imageOverlay} />
        <span className={styles.country}>
          {post.country.flagEmoji} {post.country.name}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.meta}>
          <time className={styles.date}>{formatDateShort(post.createdAt)}</time>
          <span className={styles.readTime}>{post.readTime} min read</span>
        </div>
      </div>
    </Link>
  );
}
