const { Router } = require('express');
const UserServices = require('../services/UserServices');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await UserServices.create(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  })

  .post('/sessions', async (req, res, next) => {
    try {
      const token = await UserServices.signIn(req.body);
      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully' });
    } catch (e) {
      next(e);
    }
  });
