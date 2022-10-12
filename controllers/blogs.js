const blogsRouter = require('express').Router();
const ErrorName = require('../enums/ErrorName');
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  return response.status(200).json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  return response.status(200).json(blog);
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, url, likes } = request.body;
  const data = { ...request.body, likes: likes || 0 };

  if (!(title && url)) {
    return response.status(400).json({ error: { message: 'malformed request' } });
  }

  const { user } = request;
  const blog = new Blog({ ...data, user: user.id });
  const saved = await blog.save();

  const ids = user.blogs.map((id) => id.toString());
  const exists = ids.find((id) => id === saved.id);

  if (!exists) {
    user.blogs = user.blogs.concat(saved.id);
    await user.save();
  }

  const populated = await saved.populate('user', { username: 1, name: 1 });
  return response.status(201).json(populated);
});

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { user } = request;
  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return next({ name: ErrorName.NotFound });
  }

  if (blog.user.toString() !== user.id.toString()) {
    return next({ name: ErrorName.Unauthorized });
  }

  await blog.delete();
  return response.status(204).end();
});

blogsRouter.put('/:id', userExtractor, async (request, response, next) => {
  const {
    author, title, url, likes,
  } = request.body;

  const { user } = request;
  const blog = await Blog.findById(request.params.id);
  const a = { author, title, url };
  const b = { author: blog.author, title: blog.title, url: blog.url };
  const onlyUpdatingLikes = JSON.stringify(a) === JSON.stringify(b);
  const ownedByUser = blog.user.toString() === user.id.toString();
  let updated;

  const update = async (props) => {
    updated = await Blog.findByIdAndUpdate(blog.id, props, {
      returnDocument: 'after',
    }).populate('user', { username: 1, name: 1 });

    response.status(201).json(updated);
  };

  if (ownedByUser) {
    return update({
      author, title, url, likes,
    });
  }

  if (onlyUpdatingLikes) {
    return update({
      likes,
    });
  }

  return next({ name: ErrorName.Unauthorized });
});

module.exports = blogsRouter;
