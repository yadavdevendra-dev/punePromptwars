import { Storage } from '@google-cloud/storage';
import { logger } from './logger.service.js';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3',
});

// We will use a bucket named after the project ID
const BUCKET_NAME = `${process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3'}-lessons`;

export const saveLessonToCloud = async (topic, content) => {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists, if not, it will fail gracefully
    const [exists] = await bucket.exists();
    if (!exists) {
      logger.warn(`Storage bucket ${BUCKET_NAME} does not exist. Please create it.`);
      return null;
    }

    const filename = `lessons/${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
    const file = bucket.file(filename);
    
    await file.save(content, {
      contentType: 'text/markdown',
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
    logger.info('Lesson saved to Cloud Storage', { url: publicUrl });
    
    return publicUrl;
  } catch (error) {
    logger.error('Cloud Storage Error', { error: error.message });
    return null; // Fail gracefully so it doesn't break the app
  }
};
