import { Router } from 'express';
import {
  getGallery,
  createGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadGallery } from '../services/cloudinary.service';

const router = Router();

router.get('/', getGallery);
router.post('/', requireAuth, uploadGallery.array('files', 50), createGalleryItems);
router.put('/:id', requireAuth, updateGalleryItem);
router.delete('/:id', requireAuth, deleteGalleryItem);

export default router;
