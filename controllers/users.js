const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

usersRouter.get('/', async (request, response, next) => {
  const users = await User.find({});
  if (users) {
    return response.status(200).json(users);
  }

  return next();
});

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!(username && name && password)) {
    return response.status(400).json({ error: { message: 'malformed request' } });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = new User({ username, name, hashedPassword });
  const saved = await user.save();

  if (saved) {
    return response.status(201).json(saved);
  }

  return next();
});

module.exports = usersRouter;
