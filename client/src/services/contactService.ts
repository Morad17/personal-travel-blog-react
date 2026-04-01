import { api } from './api';
import type { ContactMessage } from '../types';

export const contactService = {
  submit(data: { name: string; email: string; subject: string; message: string }) {
    return api.post('/contact', data);
  },

  getMessages() {
    return api.get<ContactMessage[]>('/contact');
  },

  markRead(id: string) {
    return api.patch<ContactMessage>(`/contact/${id}/read`);
  },
};
