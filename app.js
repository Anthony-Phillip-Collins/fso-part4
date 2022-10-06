const express = require('express');
require('express-async-errors');

const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const connectToDb = require('./utils/connectToDb');
const { errorHandler, unknownEndpoint, requestLogger } = require('./utils/middleware');

const init = async () => {
  await connectToDb();

  app.use(cors());
  app.use(express.static('build'));
  app.use(express.json());
  app.use(requestLogger);

  app.use('/api/blogs', blogsRouter);
  app.use('/api/users', usersRouter);

  app.use(unknownEndpoint);
  app.use(errorHandler);
};

init();

module.exports = app;
