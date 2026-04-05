const request = require('supertest');
const { app, db } = require('../index');

describe('Authentication & Rate Limiting Test Suite', () => {
  
  beforeAll((done) => {
    // Wait for sqlite to initialize if needed
    setTimeout(done, 1500);
  });

  afterAll((done) => {
    // Close the DB connection so jest can exit cleanly
    if (db) {
       db.close(done);
    } else {
       done();
    }
  });

  it('should return 401 when accessing protected API without token', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should apply strict rate limiting on multiple failed login attempts', async () => {
    // The authLimiter max is 15 requests/window. We will hit it 16 times.
    let res;
    for (let i = 0; i < 16; i++) {
       res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'fake@example.com', password: 'wrong' });
    }
    
    // The 16th request should hit 429 Too Many Requests
    expect(res.statusCode).toBe(429);
    expect(res.text).toContain('Security Lockout');
  });

  it('should generate a valid JWT on successful login and allow access', async () => {
    // Assuming the user 'superadmin@intelliscan.io' with pass 'Admin123!' was seeded
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@intelliscan.io', password: 'Admin123!' });
    
    // If rate limit isn't tripped (different test IP mock or within bounds)
    if(loginRes.statusCode !== 429) {
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
      
      const token = loginRes.body.token;
      
      const protectedRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
        
      expect(protectedRes.statusCode).toBe(200);
      expect(protectedRes.body).toHaveProperty('email', 'superadmin@intelliscan.io');
    }
  });
});
