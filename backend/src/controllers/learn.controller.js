import { generateLearningContent } from '../services/gemini.service.js';
import db from '../db/database.js';

export const getLearningContent = async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Check progress for this topic
    db.get('SELECT level FROM progress WHERE topic = ?', [topic.toLowerCase()], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error while checking progress.' });
      }

      let currentLevel = 1;
      if (row) {
        currentLevel = row.level;
      }

      try {
        const content = await generateLearningContent(topic, currentLevel);
        res.status(200).json({ topic, level: currentLevel, content });
      } catch (geminiError) {
        res.status(500).json({ error: 'Failed to generate content from AI.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
