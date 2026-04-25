import { saveLessonToCloud } from '../services/storage.service.js';

export const saveLesson = async (req, res) => {
  const { topic, content } = req.body;
  if (!topic || !content) {
    return res.status(400).json({ error: 'Topic and content are required' });
  }

  const publicUrl = await saveLessonToCloud(topic, content);
  if (publicUrl) {
    res.status(200).json({ message: 'Saved successfully', url: publicUrl });
  } else {
    res.status(500).json({ error: 'Failed to save to Cloud Storage' });
  }
};
