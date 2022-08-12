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
  await agent.post('/api/v1/auth/login').send({ email, password });
  console.log({ user });
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
    console.log('hey res body', res.body);
    expect(res.status).toEqual(200);
  });

  afterAll(() => {
    pool.end();
  });
});
