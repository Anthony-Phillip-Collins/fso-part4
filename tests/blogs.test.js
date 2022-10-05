const supertest = require('supertest');
const { default: mongoose } = require('mongoose');
const listHelper = require('../utils/list_helper');
const blogsDummy = require('./blogsDummy');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const promises = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const blog of blogsDummy) {
    // eslint-disable-next-line no-await-in-loop
    promises.push(await new Blog(blog).save());
  }

  await Promise.all(promises);
});

describe('using local dummy blogs', () => {
  test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
  });

  test('total likes', () => {
    const result = listHelper.totalLikes(blogsDummy);
    expect(result).toBe(36);
  });

  test('favourite blog', () => {
    const result = listHelper.favoriteBlog(blogsDummy);
    expect(result).toStrictEqual({ title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 });
  });

  test('most blogs', () => {
    const result = listHelper.mostBlogs(blogsDummy);
    expect(result).toStrictEqual({ author: 'Robert C. Martin', blogs: 3 });
  });

  test('most likes', () => {
    const result = listHelper.mostLikes(blogsDummy);
    expect(result).toStrictEqual({ author: 'Edsger W. Dijkstra', likes: 17 });
  });
});

describe('reading blog posts', () => {
  test('amount of initial remote blogs equals amount of local dummy blogs', async () => {
    await api
      .get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200);

    const blogs = await Blog.find({});
    expect(blogs.length).toStrictEqual(blogsDummy.length);
  });

  test('blog has the property id', async () => {
    const blog = await Blog.findOne();
    expect(blog.id).toBeDefined();
  });
});

describe('viewing a specific blog post', () => {
  test('succeeds with a valid id', async () => {
    const blog = await Blog.findOne();

    const result = await api
      .get(`/api/blogs/${blog.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    const processed = JSON.parse(JSON.stringify(blog));

    expect(result.body).toEqual(processed);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400);
  });
});

describe('creating a blog post', () => {
  test('succeeds with valid data', async () => {
    const currentBlogPosts = await Blog.find({});
    const newBlogPost = {
      title: 'Dummy Blog',
      author: 'John Doe',
      url: 'https://dummyblog.com/',
      likes: 0,
      __v: 0,
    };

    const response = await api
      .post('/api/blogs')
      .send(newBlogPost)
      .expect('Content-Type', /json/)
      .expect(201);

    const updatedBlogPosts = await Blog.find({});
    const latestBlogPost = await Blog.findById(response.body.id);
    const {
      title, author, url, likes, __v,
    } = latestBlogPost;

    expect(updatedBlogPosts.length).toEqual(currentBlogPosts.length + 1);
    expect({
      title, author, url, likes, __v,
    }).toStrictEqual(newBlogPost);

    expect();
  });

  test('adds 0 likes as default', async () => {
    const newBlogPost = {
      title: 'No Likes Blog',
      author: 'John Doe',
      url: 'https://nolikesblog.com/',
      __v: 0,
    };

    const response = await api
      .post('/api/blogs')
      .send(newBlogPost)
      .expect('Content-Type', /json/)
      .expect(201);

    const latestBlogPost = await Blog.findById(response.body.id);

    expect(latestBlogPost.likes).toEqual(0);
  });

  test('fails with status code 400 if data invalid', async () => {
    const newBlogPost = {
      author: 'John Doe',
      __v: 0,
    };

    const noTitle = {
      ...newBlogPost,
      url: 'https://nolikesblog.com/',
    };

    const noUrl = {
      ...newBlogPost,
      title: 'Some Blog',
    };

    await api
      .post('/api/blogs')
      .send(noTitle)
      .expect(400);

    await api
      .post('/api/blogs')
      .send(noUrl)
      .expect(400);
  });
});

describe('deleting a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const { id } = await Blog.findOne();

    await api
      .delete(`/api/blogs/${id}`)
      .expect(204);
  });
  test('returns status code 404 if id no longer exists', async () => {
    const { id } = await Blog.findOne();

    await api
      .delete(`/api/blogs/${id}`)
      .expect(204);

    await api
      .delete(`/api/blogs/${id}`)
      .expect(404);
  });
});

describe('updating a blog post', () => {
  test('succeeds with status code 201 if id is valid', async () => {
    const { id } = await Blog.findOne();
    const update = {
      title: 'Springfield News', author: 'Homer Simpson', url: 'https://en.wikipedia.org/wiki/The_Simpsons', likes: 99,
    };
    await api
      .put(`/api/blogs/${id}`)
      .send(update)
      .expect(201);

    const {
      title, author, url, likes,
    } = await Blog.findById(id);

    expect({
      title, author, url, likes,
    }).toStrictEqual(update);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
