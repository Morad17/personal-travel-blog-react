import { Router } from 'express';
import {
  getCountries,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
} from '../controllers/countries.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadImage } from '../services/cloudinary.service';

const router = Router();

router.get('/', getCountries);
router.get('/:slug', getCountryBySlug);
router.post('/', requireAuth, uploadImage.single('coverImage'), createCountry);
router.put('/:id', requireAuth, uploadImage.single('coverImage'), updateCountry);
router.delete('/:id', requireAuth, deleteCountry);

export default router;
