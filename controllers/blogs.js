const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then((blogs) => {
      response.json(blogs);
    })
    .catch((error) => {
      logger.error('ERROR', error);
    });
});

blogsRouter.post('/', (request, response) => {
  const { title, url, likes } = request.body;
  const data = { ...request.body };
  data.likes = likes || 0;

  if (!title || !url) {
    response.status(400).json({ error: { message: 'malformed request' } });
    return;
  }

  const blog = new Blog(data);

  blog
    .save()
    .then((result) => {
      response.status(201).json(result);
    });
});

module.exports = blogsRouter;
