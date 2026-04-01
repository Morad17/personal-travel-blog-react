import { Router } from 'express';
import { getVisitedCountries } from '../controllers/map.controller';

const router = Router();
router.get('/visited', getVisitedCountries);
export default router;
