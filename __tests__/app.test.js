const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserServices = require('../lib/services/UserServices');

//dummy user data
const mockUser = {
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserServices.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  // console.log(user);
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      email,
      // passwordHash: expect.any(String),
    });
  });

  it('signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: mockUser.email, password: mockUser.password });
    expect(res.status).toEqual(200);
  });

  it('/protected should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/protected');
    expect(res.status).toEqual(401);
  });

  it('/users should return a 401 if user not admin', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/v1/users');
    expect(res.status).toEqual(403);
  });

  it('/users should return a 200 if user is admin', async () => {
    const agent = request.agent(app);

    await agent.post('/api/v1/users').send({
      email: 'admin',
      password: '12345',
    });
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'admin', password: '12345' });

    const res = await agent.get('/api/v1/users');
    expect(res.status).toEqual(200);
  });

  it('/users should return a 200 if user is admin', async () => {
    const [agent] = await registerAndLogin({ email: 'admin' });
    const res = await agent.get('/api/v1/users');
    expect(res.status).toEqual(200);
  });

  it('DELETE /sessions deletes the user session', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.delete('/api/v1/users/sessions');
    expect(res.status).toEqual(204);
  });

  it('GET /api/v1/secrets returns a list of secrets for autenticated users', async () => {
    const agent = request.agent(app);

    await agent.post('/api/v1/users').send({
      email: 'admin',
      password: '12345',
    });
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'admin', password: '12345' });

    const res = await agent.get('/api/v1/secrets');
    console.log(res.body);
    const secret = {
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
    };
    //sub zero a way to access an item within an array.
    // only checking the first item in the array check for title, created, and description
    expect(res.body[0]).toEqual(secret);
  });

  afterAll(() => {
    pool.end();
  });
});
