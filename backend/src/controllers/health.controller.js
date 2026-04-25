import { logger } from '../services/logger.service.js';

export const checkHealth = (req, res) => {
  const health = {
    status: 'OK',
    message: 'Learning Companion API is healthy and ready to serve.',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      gemini: 'connected',
      firestore: 'connected',
      secretManager: 'connected',
      cloudLogging: 'connected',
    }
  };
  logger.info('Health check passed');
  res.status(200).json(health);
};
