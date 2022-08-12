const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
// const authorize = require('../middleware/authorize');
// const User = require('../models/User');
const UserServices = require('../services/UserServices');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    // console.log(req.body);
    //our req.body has both email and password passing as an object
    try {
      const user = await UserServices.create(req.body);
      console.log('hello from users', user);
      res.json(user);
    } catch (err) {
      next(err);
    }
  })

  .post('/sessions', async (req, res, next) => {
    try {
      const token = await UserServices.signIn(req.body);
      // console.log('token', token);
      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully' });
    } catch (e) {
      next(e);
    }
  })

  .get('/protected', authenticate, async (req, res) => {
    res.json({ message: 'hello world' });
  });
