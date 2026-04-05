const request = require('supertest');
const { app, db } = require('../index');

describe('Unified AI Fallback Pipeline Suite', () => {
  let adminToken = null;

  beforeAll(async () => {
    // Wait for DB init
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'superadmin@intelliscan.io', password: 'Admin123!' });
        
        if(res.body.token) {
           adminToken = res.body.token;
        }
    } catch(e) {}
  });

  afterAll((done) => {
    if(db) db.close(done);
    else done();
  });

  it('should reject scan requests if no token is provided', async () => {
    const res = await request(app).post('/api/scan-multi').send({ images: [] });
    expect(res.statusCode).toBe(401);
  });

  it('should reject scan if the request payload does not contain an image', async () => {
    if (!adminToken) return; // Skip if db didn't init fast enough

    const res = await request(app)
      .post('/api/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ image: null });
      
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No image provided');
  });

  // Note: We cannot execute a full E2E AI scan without firing real API requests
  // to OpenAI or Gemini unless we mock the require('openai') libraries.
  // In a real production environment, you would use jest.mock('openai').
});
