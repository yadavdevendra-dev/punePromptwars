import { Firestore } from '@google-cloud/firestore';
import { logger } from '../services/logger.service.js';

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3',
});

const COLLECTION = 'learning_progress';

// In-memory fallback if Firestore is unavailable
const memoryStore = new Map();

export const getAll = async () => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy('last_accessed', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    logger.warn('Firestore getAll failed, using memory store', { error: err.message });
    return Array.from(memoryStore.values());
  }
};

export const getByTopic = async (topic) => {
  try {
    const snapshot = await db.collection(COLLECTION)
      .where('topic', '==', topic.toLowerCase())
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (err) {
    logger.warn('Firestore getByTopic failed, using memory store', { error: err.message });
    return memoryStore.get(topic.toLowerCase()) || null;
  }
};

export const upsert = async (topic, level) => {
  const topicLower = topic.toLowerCase();
  const now = new Date().toISOString();

  try {
    const snapshot = await db.collection(COLLECTION)
      .where('topic', '==', topicLower)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({ level, last_accessed: now });
    } else {
      await db.collection(COLLECTION).add({ topic: topicLower, level, last_accessed: now });
    }
  } catch (err) {
    logger.warn('Firestore upsert failed, using memory store', { error: err.message });
    memoryStore.set(topicLower, { topic: topicLower, level, last_accessed: now });
  }

  return { topic: topicLower, level };
};
