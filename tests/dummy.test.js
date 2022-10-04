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

  test('create blog post', async () => {
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

  test('no likes', async () => {
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

  test('no title or url', async () => {
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
