const supertest = require('supertest');
const { default: mongoose } = require('mongoose');
const listHelper = require('../utils/list_helper');
const dummyBlogs = require('./dummyBlogs');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

describe('Blogs', () => {
  // test('dummy returns one', () => {
  //   const blogs = [];

  //   const result = listHelper.dummy(blogs);
  //   expect(result).toBe(1);
  // });

  // test('total likes', () => {
  //   const result = listHelper.totalLikes(dummyBlogs);
  //   expect(result).toBe(36);
  // });

  // test('favourite blog', () => {
  //   const result = listHelper.favoriteBlog(dummyBlogs);
  //   expect(result).toStrictEqual({ title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 });
  // });

  // test('most blogs', () => {
  //   const result = listHelper.mostBlogs(dummyBlogs);
  //   expect(result).toStrictEqual({ author: 'Robert C. Martin', blogs: 3 });
  // });

  // test('most likes', () => {
  //   const result = listHelper.mostLikes(dummyBlogs);
  //   expect(result).toStrictEqual({ author: 'Edsger W. Dijkstra', likes: 17 });
  // });

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200);

    const blogs = await Blog.find({});
    expect(blogs.length).toStrictEqual(dummyBlogs.length);
  });

  beforeEach(async () => {
    await Blog.deleteMany({});

    const promises = dummyBlogs.map((blog) => new Blog(blog).save());

    await Promise.all(promises);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
