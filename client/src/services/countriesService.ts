import { api } from './api';
import type { Country } from '../types';

export const countriesService = {
  getAll() {
    return api.get<Country[]>('/countries');
  },

  getBySlug(slug: string) {
    return api.get<Country & { posts: import('../types').Post[] }>(`/countries/${slug}`);
  },

  create(data: FormData) {
    return api.post<Country>('/countries', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  update(id: string, data: FormData) {
    return api.put<Country>(`/countries/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  delete(id: string) {
    return api.delete(`/countries/${id}`);
  },
};
