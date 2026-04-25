import request from 'supertest';
import express from 'express';
import apiRoutes from '../src/routes/api.routes.js';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

// Mock the Gemini service to avoid hitting real API during tests
jest.mock('../src/services/gemini.service.js', () => ({
  generateLearningContent: jest.fn().mockResolvedValue('Mocked learning content.'),
}));

describe('API Routes', () => {
  it('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });

  it('POST /api/learn should require a topic', async () => {
    const res = await request(app).post('/api/learn').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/learn should return learning content', async () => {
    const res = await request(app).post('/api/learn').send({ topic: 'JavaScript' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.topic).toEqual('JavaScript');
    expect(res.body.content).toEqual('Mocked learning content.');
  });
});
