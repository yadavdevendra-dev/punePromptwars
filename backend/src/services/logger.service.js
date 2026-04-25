import { Logging } from '@google-cloud/logging';

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3',
});

const log = logging.log('learning-companion');

const writeLog = async (severity, message, metadata = {}) => {
  try {
    const entry = log.entry(
      { resource: { type: 'global' }, severity },
      { message, ...metadata, timestamp: new Date().toISOString() }
    );
    await log.write(entry);
  } catch {
    // Fallback to console if Cloud Logging unavailable (local dev)
    console[severity === 'ERROR' ? 'error' : 'log'](`[${severity}] ${message}`, metadata);
  }
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
    writeLog('INFO', message, meta);
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, meta);
    writeLog('ERROR', message, meta);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARNING] ${message}`, meta);
    writeLog('WARNING', message, meta);
  },
};
