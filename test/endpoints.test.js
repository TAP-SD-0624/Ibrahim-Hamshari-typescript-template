const app = require('../dist/server').default;
const supertest = require('supertest');
const request = supertest(app);

test('Gets the test endpoint', async () => {
  const res = await request.get('/');
  expect(res.status).toBe(200);
});
