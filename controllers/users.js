const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

usersRouter.get('/', async (request, response, next) => {
  const users = await User.find({}).populate('blogs', { url: 1, author: 1, title: 1 });
  if (users) {
    return response.status(200).json(users);
  }

  return next();
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!(username && password)) {
    return response.status(400).json({ error: { message: 'malformed request' } });
  }

  if (password.length < 3) {
    return response.status(400).json({ error: { message: 'The username has to be at least 3 characters long!' } });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = new User({
    username,
    name: name || username,
    hashedPassword,
  });
  const saved = await user.save();

  return response.status(201).json(saved);
});

module.exports = usersRouter;
