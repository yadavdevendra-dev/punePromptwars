import { getAll, getByTopic, upsert } from '../db/database.js';

export const getProgress = (req, res) => {
  try {
    const rows = getAll();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
};

export const updateProgress = (req, res) => {
  const { topic, completed } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const existing = getByTopic(topic);
    const currentLevel = existing ? existing.level : 1;
    const newLevel = completed ? currentLevel + 1 : currentLevel;
    const result = upsert(topic, newLevel);

    res.status(200).json({ message: 'Progress updated', ...result });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
};
