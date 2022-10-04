const supertest = require('supertest');
const { default: mongoose } = require('mongoose');
const listHelper = require('../utils/list_helper');
const dummyBlogs = require('./dummyBlogs');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

describe('Blogs', () => {
  test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
  });

  test('total likes', () => {
    const result = listHelper.totalLikes(dummyBlogs);
    expect(result).toBe(36);
  });

  test('favourite blog', () => {
    const result = listHelper.favoriteBlog(dummyBlogs);
    expect(result).toStrictEqual({ title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 });
  });

  test('most blogs', () => {
    const result = listHelper.mostBlogs(dummyBlogs);
    expect(result).toStrictEqual({ author: 'Robert C. Martin', blogs: 3 });
  });

  test('most likes', () => {
    const result = listHelper.mostLikes(dummyBlogs);
    expect(result).toStrictEqual({ author: 'Edsger W. Dijkstra', likes: 17 });
  });

  test('correct amount of blogs', async () => {
    await api
      .get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200);

    const blogs = await Blog.find({});
    expect(blogs.length).toStrictEqual(dummyBlogs.length);
  });

  test('blog has id', async () => {
    const blog = await Blog.findOne();
    expect(blog.id).toBeDefined();
  });

  beforeEach(async () => {
    await Blog.deleteMany({});

    const promises = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const blog of dummyBlogs) {
      // eslint-disable-next-line no-await-in-loop
      promises.push(await new Blog(blog).save());
    }

    await Promise.all(promises);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
