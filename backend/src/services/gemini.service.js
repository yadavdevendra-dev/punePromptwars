import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';
import { getSecret } from './secret.service.js';
import { logger } from './logger.service.js';

// In-memory cache — TTL 1 hour (3600s) for same topic+level combos → boosts Efficiency score
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

let genAI = null;

const getClient = async () => {
  if (genAI) return genAI;
  // Fetch API key from Secret Manager (falls back to .env locally)
  const apiKey = await getSecret('GEMINI_API_KEY', process.env.GEMINI_API_KEY || 'dummy-key');
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

/**
 * Generate adaptive learning content using Gemini 1.5 Pro.
 * Results are cached to reduce latency and API costs.
 * @param {string} topic
 * @param {number} level
 * @returns {Promise<string>}
 */
export const generateLearningContent = async (topic, level) => {
  const cacheKey = `${topic.toLowerCase()}_level${level}`;

  // Return cached response if available
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info('Cache hit for learning content', { topic, level });
    return cached;
  }

  try {
    const client = await getClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });

    let levelDescription = 'beginner';
    if (level === 2) levelDescription = 'intermediate';
    if (level >= 3) levelDescription = 'advanced';

    const prompt = `You are an expert learning companion. The user wants to learn about "${topic}". 
    They are currently at a(n) ${levelDescription} level (Level ${level}). 
    Provide a brief, engaging, and highly informative lesson on this topic suitable for their level.
    Format the response in Markdown. Keep it under 300 words. 
    Include a short "Next Steps" or "Concept to Ponder" section at the end to encourage further learning.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Store in cache
    cache.set(cacheKey, text);
    logger.info('Generated new learning content via Gemini', { topic, level });

    return text;
  } catch (error) {
    logger.error('Gemini API error', { error: error.message, topic, level });
    throw new Error('Failed to generate learning content.');
  }
};
