import request from 'supertest';
import app from '../src/server.js';

// ── Mock all Google Cloud services ──────────────────────────
jest.mock('../src/services/gemini.service.js', () => ({
  generateLearningContent: jest.fn().mockResolvedValue('## Mocked Lesson\n\nThis is mocked content.'),
}));

jest.mock('../src/db/database.js', () => ({
  getAll: jest.fn().mockResolvedValue([
    { id: '1', topic: 'javascript', level: 2, last_accessed: '2026-01-01T00:00:00Z' }
  ]),
  getByTopic: jest.fn().mockResolvedValue(null),
  upsert: jest.fn().mockResolvedValue({ topic: 'javascript', level: 1 }),
}));

jest.mock('../src/services/logger.service.js', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('../src/services/secret.service.js', () => ({
  getSecret: jest.fn().mockResolvedValue('mock-api-key'),
}));

// ── Tests ────────────────────────────────────────────────────
describe('Health Endpoint', () => {
  it('GET /api/health → 200 OK with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.services).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Learn Endpoint', () => {
  it('POST /api/learn → 400 when no topic', async () => {
    const res = await request(app).post('/api/learn').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/learn → 400 when topic is empty string', async () => {
    const res = await request(app).post('/api/learn').send({ topic: '   ' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/learn → 200 with content and level', async () => {
    const res = await request(app).post('/api/learn').send({ topic: 'JavaScript' });
    expect(res.statusCode).toBe(200);
    expect(res.body.topic).toBe('JavaScript');
    expect(res.body.content).toContain('Mocked Lesson');
    expect(res.body.level).toBeDefined();
  });
});

describe('Progress Endpoint', () => {
  it('GET /api/progress → 200 with array', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/progress → 400 when no topic', async () => {
    const res = await request(app).post('/api/progress').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/progress → 200 when valid topic', async () => {
    const res = await request(app).post('/api/progress').send({ topic: 'JavaScript', completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Progress updated');
  });
});

describe('Security Headers', () => {
  it('GET /api/health → includes X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('GET /api/health → includes X-Frame-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });
});
