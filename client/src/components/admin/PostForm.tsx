import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { postsService } from '../../services/postsService';
import { countriesService } from '../../services/countriesService';
import type { Post } from '../../types';
import styles from './PostForm.module.scss';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  excerpt: z.string().min(1, 'Required'),
  countryId: z.string().min(1, 'Required'),
  tags: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  post: Post | null;
  onClose: () => void;
}

export default function PostForm({ post, onClose }: Props) {
  const qc = useQueryClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your story...' }),
    ],
    content: post?.content ?? '',
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      countryId: post?.countryId ?? '',
      tags: post?.tags.join(', ') ?? '',
      published: post?.published ?? false,
      featured: post?.featured ?? false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      fd.append('content', editor?.getHTML() ?? '');
      if (coverFile) fd.append('coverImage', coverFile);

      if (post) return postsService.update(post.id, fd);
      return postsService.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    },
    onError: () => setError('Failed to save post'),
  });

  return (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <h3>{post ? 'Edit Post' : 'New Post'}</h3>
        <button onClick={onClose} className={styles.closeBtn}>✕</button>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Title</label>
            <input {...register('title')} className={styles.input} />
            {errors.title && <span className={styles.err}>{errors.title.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Slug</label>
            <input {...register('slug')} className={styles.input} />
            {errors.slug && <span className={styles.err}>{errors.slug.message}</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label>Excerpt</label>
          <textarea {...register('excerpt')} className={styles.textarea} rows={2} />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Country</label>
            <select {...register('countryId')} className={styles.select}>
              <option value="">Select country</option>
              {countries?.map((c) => (
                <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>
              ))}
            </select>
            {errors.countryId && <span className={styles.err}>{errors.countryId.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Tags (comma-separated)</label>
            <input {...register('tags')} className={styles.input} placeholder="travel, food, culture" />
          </div>
        </div>

        <div className={styles.field}>
          <label>Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className={styles.fileInput} />
          {post?.coverImageUrl && <img src={post.coverImageUrl} alt="" className={styles.preview} />}
        </div>

        <div className={styles.field}>
          <label>Content</label>
          <div className={styles.editorToolbar}>
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? styles.active : ''}>B</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? styles.active : ''}>I</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</button>
          </div>
          <div className={styles.editor}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('published')} />
            Published
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" {...register('featured')} />
            Featured
          </label>
        </div>

        {error && <p className={styles.err}>{error}</p>}

        <div className={styles.formActions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={styles.saveBtn}>
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
