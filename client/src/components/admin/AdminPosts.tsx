import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService } from '../../services/postsService';
import { formatDateShort } from '../../utils/formatDate';
import PostForm from './PostForm';
import type { Post } from '../../types';
import styles from './AdminTable.module.scss';

export default function AdminPosts() {
  const qc = useQueryClient();
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({
    queryKey: ['posts', { page: 1, limit: 50 }],
    queryFn: () => postsService.getAll({ page: 1, limit: 50 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });

  const handleEdit = (post: Post) => { setEditPost(post); setShowForm(true); };
  const handleCreate = () => { setEditPost(null); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditPost(null); };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>Posts</h2>
        <button className={styles.createBtn} onClick={handleCreate}>+ New Post</button>
      </div>

      {showForm ? (
        <PostForm post={editPost} onClose={handleClose} />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Country</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.posts?.map((post) => (
              <tr key={post.id}>
                <td className={styles.titleCell}>{post.title}</td>
                <td>{post.country.flagEmoji} {post.country.name}</td>
                <td>
                  <span className={`${styles.badge} ${post.published ? styles.published : styles.draft}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{formatDateShort(post.createdAt)}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(post)}>Edit</button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => window.confirm('Delete this post?') && deleteMutation.mutate(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
