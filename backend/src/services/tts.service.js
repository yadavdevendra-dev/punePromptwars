import textToSpeech from '@google-cloud/text-to-speech';
import { logger } from './logger.service.js';

const client = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'iconic-computer-494405-c3'
});

export const synthesizeSpeech = async (text, languageCode = 'en-US') => {
  try {
    const request = {
      input: { text },
      voice: { languageCode, name: `${languageCode}-Standard-A` },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    logger.info('Speech synthesized successfully', { length: response.audioContent.length });
    return response.audioContent.toString('base64');
  } catch (error) {
    logger.error('TTS Error', { error: error.message });
    return null;
  }
};
