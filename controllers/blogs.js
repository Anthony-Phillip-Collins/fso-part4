const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({});

  if (blogs) {
    return response.status(200).json(blogs);
  }

  next();
});

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    return response.status(200).json(blog);
  }

  next();
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, url, likes } = request.body;
  const data = { ...request.body };
  data.likes = likes || 0;

  if (!title || !url) {
    return response.status(400).json({ error: { message: 'malformed request' } });
  }

  const blog = new Blog(data);
  const saved = await blog.save();

  if (saved) {
    return response.status(201).json(saved);
  }

  next();
});

blogsRouter.delete('/:id', async (request, response, next) => {
  const blog = await Blog.findByIdAndDelete(request.params.id);

  if (blog) {
    return response.status(204).end();
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
    return response.status(201).json(blog);
  }

  next();
});

module.exports = blogsRouter;
