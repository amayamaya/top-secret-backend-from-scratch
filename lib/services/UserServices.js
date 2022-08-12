const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = class UserServices {
  static async create({ email, password }) {
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    console.log(passwordHash);
    const user = await User.insert({
      email,
      passwordHash,
    });
    return user;
  }
  static async signIn({ email, password = '' }) {
    try {
      const user = await User.getByEmail(email);
      console.log(user);
      if (!user) throw new Error('Invalid Email');
      //getter function used here
      if (!bcrypt.compareSync(password, user.boogerFunction))
        throw new Error('Invalid Password');
      const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '1 day',
      });
      return token;
    } catch (error) {
      error.status = 401;
      throw error;
    }
  }
};
