import { generateLearningContent } from '../services/gemini.service.js';
import { getByTopic } from '../db/database.js';
import { logger } from '../services/logger.service.js';

export const getLearningContent = async (req, res) => {
  const { topic, language } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required and must be a non-empty string.' });
  }

  const sanitizedTopic = topic.trim().slice(0, 100); // input length limit
  const requestedLanguage = language || 'English';

  try {
    const row = await getByTopic(sanitizedTopic);
    const currentLevel = row ? row.level : 1;
    const content = await generateLearningContent(sanitizedTopic, currentLevel, requestedLanguage);

    logger.info('Lesson served', { topic: sanitizedTopic, level: currentLevel, language: requestedLanguage });
    res.status(200).json({ topic: sanitizedTopic, level: currentLevel, content });
  } catch (error) {
    logger.error('Learn endpoint error', { error: error.message });
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
};
