import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

/**
 * Fetches a secret value from Google Cloud Secret Manager.
 * Falls back to environment variable if Secret Manager is unavailable (local dev).
 * @param {string} secretName
 * @param {string} envFallback
 * @returns {Promise<string>}
 */
export const getSecret = async (secretName, envFallback = '') => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3';
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
  } catch {
    // Fallback to env variable for local development
    return process.env[envFallback] || envFallback;
  }
};
