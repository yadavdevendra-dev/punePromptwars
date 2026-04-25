import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-tests');

/**
 * Generate adaptive learning content based on topic and user's current level.
 * @param {string} topic 
 * @param {number} level 
 * @returns {Promise<string>}
 */
export const generateLearningContent = async (topic, level) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
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
    return response.text();
  } catch (error) {
    console.error('Error in Gemini Service:', error);
    throw new Error('Failed to generate learning content.');
  }
};
