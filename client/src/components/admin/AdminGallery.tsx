import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '../../services/galleryService';
import { countriesService } from '../../services/countriesService';
import styles from './AdminGallery.module.scss';
import tableStyles from './AdminTable.module.scss';

export default function AdminGallery() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [countryId, setCountryId] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ['gallery', {}],
    queryFn: () => galleryService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      if (countryId) fd.append('countryId', countryId);
      await galleryService.upload(fd);
      qc.invalidateQueries({ queryKey: ['gallery'] });
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <h2 className={tableStyles.heading}>Gallery</h2>
      </div>

      <div className={styles.uploadPanel}>
        <h3 className={styles.uploadTitle}>Upload Media</h3>
        <div className={styles.uploadRow}>
          <input type="file" ref={fileRef} multiple accept="image/*,video/*" className={styles.fileInput} />
          <select value={countryId} onChange={(e) => setCountryId(e.target.value)} className={styles.select}>
            <option value="">No country</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>
            ))}
          </select>
          <button onClick={handleUpload} disabled={uploading} className={styles.uploadBtn}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {data?.items?.map((item) => (
          <div key={item.id} className={styles.item}>
            <img src={item.thumbnailUrl} alt="" className={styles.thumb} />
            {item.resourceType === 'video' && <div className={styles.videoTag}>VIDEO</div>}
            <button
              className={styles.deleteItem}
              onClick={() => window.confirm('Delete?') && deleteMutation.mutate(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
