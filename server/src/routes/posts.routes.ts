import { Router } from 'express';
import {
  getPosts,
  getFeaturedPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  addPostMedia,
  deletePostMedia,
} from '../controllers/posts.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadImage, uploadMedia } from '../services/cloudinary.service';

const router = Router();

router.get('/', getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/:slug', getPostBySlug);
router.post('/', requireAuth, uploadImage.single('coverImage'), createPost);
router.put('/:id', requireAuth, uploadImage.single('coverImage'), updatePost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/media', requireAuth, uploadMedia.array('files', 20), addPostMedia);
router.delete('/:id/media/:mediaId', requireAuth, deletePostMedia);

export default router;
