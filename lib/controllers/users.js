const { Router } = require('express');
const UserServices = require('../services/UserServices');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    const user = await UserServices.create(req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
