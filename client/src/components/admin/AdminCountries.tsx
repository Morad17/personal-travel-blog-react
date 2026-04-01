import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { countriesService } from '../../services/countriesService';
import type { Country } from '../../types';
import styles from './AdminTable.module.scss';
import formStyles from './CountryForm.module.scss';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  isoCode: z.string().length(2),
  flagEmoji: z.string().min(1),
  visitedAt: z.string().optional(),
  featured: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function CountryForm({ country, onClose }: { country: Country | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: country?.name ?? '',
      slug: country?.slug ?? '',
      isoCode: country?.isoCode ?? '',
      flagEmoji: country?.flagEmoji ?? '',
      visitedAt: country?.visitedAt?.slice(0, 10) ?? '',
      featured: country?.featured ?? false,
    },
  });

  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, String(v));
      });
      if (coverFile) fd.append('coverImage', coverFile);
      if (country) return countriesService.update(country.id, fd);
      return countriesService.create(fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['countries'] }); onClose(); },
  });

  return (
    <div className={formStyles.form}>
      <div className={formStyles.header}>
        <h3>{country ? 'Edit Country' : 'Add Country'}</h3>
        <button onClick={onClose} className={formStyles.close}>✕</button>
      </div>
      <form onSubmit={handleSubmit((d) => save.mutate(d))}>
        <div className={formStyles.grid}>
          <input {...register('name')} placeholder="Country name" className={formStyles.input} />
          <input {...register('slug')} placeholder="slug (e.g. morocco)" className={formStyles.input} />
          <input {...register('isoCode')} placeholder="ISO code (e.g. MA)" maxLength={2} className={formStyles.input} />
          <input {...register('flagEmoji')} placeholder="Flag emoji 🇲🇦" className={formStyles.input} />
          <input {...register('visitedAt')} type="date" className={formStyles.input} />
          <label className={formStyles.check}>
            <input type="checkbox" {...register('featured')} /> Featured
          </label>
        </div>
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className={formStyles.file} />
        <div className={formStyles.actions}>
          <button type="button" onClick={onClose} className={formStyles.cancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={formStyles.save}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCountries() {
  const qc = useQueryClient();
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => countriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['countries'] }),
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>Countries</h2>
        <button className={styles.createBtn} onClick={() => { setEditCountry(null); setShowForm(true); }}>+ Add Country</button>
      </div>

      {showForm ? (
        <CountryForm country={editCountry} onClose={() => { setShowForm(false); setEditCountry(null); }} />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Country</th><th>ISO</th><th>Visited</th><th>Posts</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {countries?.map((c) => (
              <tr key={c.id}>
                <td>{c.flagEmoji} {c.name}</td>
                <td>{c.isoCode}</td>
                <td>{c.visitedAt ? c.visitedAt.slice(0, 10) : '–'}</td>
                <td>{c._count?.posts ?? 0}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => { setEditCountry(c); setShowForm(true); }}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => window.confirm('Delete?') && deleteMutation.mutate(c.id)}>Delete</button>
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
