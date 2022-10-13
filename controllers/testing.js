const testingRouter = require('express').Router();
const ErrorName = require('../enums/ErrorName');
const Blog = require('../models/blog');
const User = require('../models/user');

testingRouter.post('/reset', async (request, response, next) => {
  if (process.env.NODE_ENV === 'test') {
    await Blog.deleteMany({});
    await User.deleteMany({});
    return response.status(200).send('Database reset success.');
  }

  return next({ name: ErrorName.NotInTestMode });
});

module.exports = testingRouter;
