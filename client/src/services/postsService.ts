import { api } from './api';
import type { Post, PaginatedResponse } from '../types';

export const postsService = {
  getAll(params?: { country?: string; tag?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<Post>>('/posts', { params });
  },

  getFeatured() {
    return api.get<Post[]>('/posts/featured');
  },

  getBySlug(slug: string) {
    return api.get<Post>(`/posts/${slug}`);
  },

  create(data: FormData) {
    return api.post<Post>('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  update(id: string, data: FormData) {
    return api.put<Post>(`/posts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  delete(id: string) {
    return api.delete(`/posts/${id}`);
  },

  addMedia(id: string, files: FormData) {
    return api.post(`/posts/${id}/media`, files, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  deleteMedia(postId: string, mediaId: string) {
    return api.delete(`/posts/${postId}/media/${mediaId}`);
  },
};
