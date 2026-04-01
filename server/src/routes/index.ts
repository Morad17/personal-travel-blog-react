import { Router } from 'express';
import authRoutes from './auth.routes';
import countriesRoutes from './countries.routes';
import postsRoutes from './posts.routes';
import galleryRoutes from './gallery.routes';
import contactRoutes from './contact.routes';
import mapRoutes from './map.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/countries', countriesRoutes);
router.use('/posts', postsRoutes);
router.use('/gallery', galleryRoutes);
router.use('/contact', contactRoutes);
router.use('/map', mapRoutes);

export default router;
