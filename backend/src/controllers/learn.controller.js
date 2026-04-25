import { getAll, getByTopic } from '../db/database.js';
import { generateLearningContent } from '../services/gemini.service.js';

export const getLearningContent = async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const row = getByTopic(topic);
    const currentLevel = row ? row.level : 1;
    const content = await generateLearningContent(topic, currentLevel);
    res.status(200).json({ topic, level: currentLevel, content });
  } catch (error) {
    console.error('Learn error:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
};
