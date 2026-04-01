import { Router } from 'express';
import { submitContact, getMessages, markRead } from '../controllers/contact.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', submitContact);
router.get('/', requireAuth, getMessages);
router.patch('/:id/read', requireAuth, markRead);

export default router;
