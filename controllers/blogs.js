const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const ErrorName = require('../enums/ErrorName');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  if (blogs) {
    return response.status(200).json(blogs);
  }

  return next();
});

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    return response.status(200).json(blog);
  }

  return next();
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, url, likes } = request.body;
  const data = { ...request.body, likes: likes || 0 };

  if (!(title && url)) {
    return response.status(400).json({ error: { message: 'malformed request' } });
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  const blog = new Blog({ ...data, user: user.id });
  const saved = await blog.save();

  if (saved) {
    const ids = user.blogs.map((id) => id.toString());
    const exists = ids.find((id) => id === blog.id);
    if (!exists) {
      user.blogs = user.blogs.concat(blog.id);
      await user.save();
    }

    return response.status(201).json(saved);
  }

  return next();
});

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const blog = await Blog.findById(request.params.id);
  const user = await User.findById(decodedToken.id);

  if (!blog) {
    return next({ name: ErrorName.NotFound });
  }

  if (blog.user.toString() !== user.id.toString()) {
    return next({ name: ErrorName.AccessDenied });
  }

  await blog.delete();
  return response.status(204).end();
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

  return next();
});

module.exports = blogsRouter;
