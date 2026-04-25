import { Firestore } from '@google-cloud/firestore';

// Google Cloud Firestore - replaces JSON file storage
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'iconic-computer-494405-c3',
});

const COLLECTION = 'learning_progress';

export const getAll = async () => {
  const snapshot = await db.collection(COLLECTION).orderBy('last_accessed', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getByTopic = async (topic) => {
  const snapshot = await db.collection(COLLECTION)
    .where('topic', '==', topic.toLowerCase())
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const upsert = async (topic, level) => {
  const topicLower = topic.toLowerCase();
  const now = new Date().toISOString();
  const snapshot = await db.collection(COLLECTION)
    .where('topic', '==', topicLower)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update({ level, last_accessed: now });
  } else {
    await db.collection(COLLECTION).add({ topic: topicLower, level, last_accessed: now });
  }

  return { topic: topicLower, level };
};
