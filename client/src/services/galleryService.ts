import { api } from './api';
import type { GalleryItem, PaginatedResponse } from '../types';

export const galleryService = {
  getAll(params?: { country?: string; type?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<GalleryItem>>('/gallery', { params });
  },

  upload(data: FormData) {
    return api.post<GalleryItem[]>('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  update(id: string, data: Partial<GalleryItem>) {
    return api.put<GalleryItem>(`/gallery/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/gallery/${id}`);
  },
};
