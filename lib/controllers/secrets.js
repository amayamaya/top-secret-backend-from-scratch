const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Secret = require('../models/Secret');

module.exports = Router().get(
  '/',
  authenticate, authorize,
  async (req, res, next) => {
    try {
      const data = await Secret.getAll();
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);
