const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({});

  if (blogs) {
    response.status(200).json(blogs);
    return;
  }

  next();
});

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    response.status(200).json(blog);
    return;
  }

  next();
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, url, likes } = request.body;
  const data = { ...request.body };
  data.likes = likes || 0;

  if (!title || !url) {
    response.status(400).json({ error: { message: 'malformed request' } });
    return;
  }

  const blog = new Blog(data);
  const saved = await blog.save();

  if (saved) {
    response.status(201).json(saved);
    return;
  }

  next();
});

blogsRouter.delete('/:id', async (request, response, next) => {
  const blog = await Blog.findByIdAndDelete(request.params.id);

  if (blog) {
    response.status(204).end();
    return;
  }

  next();
});

blogsRouter.put('/:id', async (request, response, next) => {
  const {
    author, title, url, likes,
  } = request.body;

  const blog = await Blog.findByIdAndUpdate(request.params.id, {
    author, title, url, likes,
  }, {
    returnDocument: 'after',
  });

  if (blog) {
    response.status(201).json(blog);
    return;
  }

  next();
});

module.exports = blogsRouter;
