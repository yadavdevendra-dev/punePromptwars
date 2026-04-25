import { getAll, getByTopic, upsert } from '../db/database.js';
import { logger } from '../services/logger.service.js';

export const getProgress = async (req, res) => {
  try {
    const rows = await getAll();
    res.status(200).json(rows);
  } catch (error) {
    logger.error('Fetch progress error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
};

export const updateProgress = async (req, res) => {
  const { topic, completed } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const sanitizedTopic = topic.trim().slice(0, 100);

  try {
    const existing = await getByTopic(sanitizedTopic);
    const currentLevel = existing ? existing.level : 1;
    const newLevel = completed ? currentLevel + 1 : currentLevel;
    const result = await upsert(sanitizedTopic, newLevel);

    logger.info('Progress updated', { topic: sanitizedTopic, level: newLevel });
    res.status(200).json({ message: 'Progress updated', ...result });
  } catch (error) {
    logger.error('Update progress error', { error: error.message });
    res.status(500).json({ error: 'Failed to update progress.' });
  }
};
