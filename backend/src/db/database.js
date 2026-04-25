import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In a real production deployment on Cloud Run, a local sqlite file will be lost on container restart.
// For a true stateless app, consider Cloud SQL or Firestore. This is an MVP setup.
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.resolve(__dirname, '../../data.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to the SQLite database (${dbPath}).`);
    db.run(`CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      }
    });
  }
});

export default db;
