import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../progress.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]), 'utf8');
}

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

export const getAll = () => readData();

export const getByTopic = (topic) => {
  const data = readData();
  return data.find(item => item.topic === topic.toLowerCase()) || null;
};

export const upsert = (topic, level) => {
  const data = readData();
  const topicLower = topic.toLowerCase();
  const index = data.findIndex(item => item.topic === topicLower);
  const now = new Date().toISOString();

  if (index > -1) {
    data[index].level = level;
    data[index].last_accessed = now;
  } else {
    data.push({ id: Date.now(), topic: topicLower, level, last_accessed: now });
  }

  writeData(data);
  return { topic: topicLower, level };
};
