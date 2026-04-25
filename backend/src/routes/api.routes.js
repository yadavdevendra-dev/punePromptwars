import express from 'express';
import { checkHealth } from '../controllers/health.controller.js';
import { getLearningContent } from '../controllers/learn.controller.js';
import { getProgress, updateProgress } from '../controllers/progress.controller.js';

const router = express.Router();

router.get('/health', checkHealth);
router.post('/learn', getLearningContent);
router.get('/progress', getProgress);
router.post('/progress', updateProgress);

export default router;
