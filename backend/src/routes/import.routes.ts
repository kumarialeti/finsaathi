import { Router } from 'express';
import multer from 'multer';
import { importStatement } from '../controllers/import.controller';
import { requireAuth } from '../middleware/auth.middleware';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(requireAuth);

router.post('/statement', upload.single('file'), importStatement);

export default router;
