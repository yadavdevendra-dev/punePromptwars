import db from '../db/database.js';

export const getProgress = (req, res) => {
  db.all('SELECT * FROM progress ORDER BY last_accessed DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch progress.' });
    }
    res.status(200).json(rows);
  });
};

export const updateProgress = (req, res) => {
  const { topic, completed } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const topicLower = topic.toLowerCase();

  db.get('SELECT id, level FROM progress WHERE topic = ?', [topicLower], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }

    if (row) {
      const newLevel = completed ? row.level + 1 : row.level;
      db.run('UPDATE progress SET level = ?, last_accessed = CURRENT_TIMESTAMP WHERE id = ?', [newLevel, row.id], function(updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to update progress.' });
        }
        res.status(200).json({ message: 'Progress updated', topic: topicLower, level: newLevel });
      });
    } else {
      const initialLevel = completed ? 2 : 1;
      db.run('INSERT INTO progress (topic, level) VALUES (?, ?)', [topicLower, initialLevel], function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'Failed to save new progress.' });
        }
        res.status(201).json({ message: 'Progress tracked', topic: topicLower, level: initialLevel });
      });
    }
  });
};
