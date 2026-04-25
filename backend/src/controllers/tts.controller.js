import { synthesizeSpeech } from '../services/tts.service.js';

export const getAudio = async (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  // Map language to code
  const langMap = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'Marathi': 'mr-IN'
  };

  const code = langMap[language] || 'en-US';
  
  // Clean markdown from text
  const cleanText = text.replace(/[#*_~`]/g, '').slice(0, 4900); // API limit ~5000 chars

  const audioBase64 = await synthesizeSpeech(cleanText, code);
  
  if (audioBase64) {
    res.status(200).json({ audio: audioBase64 });
  } else {
    res.status(500).json({ error: 'TTS Failed' });
  }
};
