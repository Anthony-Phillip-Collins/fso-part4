const supertest = require('supertest');
const mongoose = require('mongoose');
const testHelper = require('../../utils/test_helper');
const blogsDummy = require('./blogsDummy');
const app = require('../../app');
const Blog = require('../../models/blog');
const connectToDb = require('../../utils/connectToDb');

const api = supertest(app);

const blogsTests = () => {
  beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) {
      await connectToDb();
    }

    await Blog.deleteMany({});

    const promises = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const blog of blogsDummy) {
      // eslint-disable-next-line no-await-in-loop
      promises.push(await api.post('/api/blogs').send(blog));
    }

    await Promise.all(promises);
  });

  describe('using local dummy blogs', () => {
    test('dummy returns one', () => {
      const blogs = [];

      const result = testHelper.dummy(blogs);
      expect(result).toBe(1);
    });

    test('total likes', () => {
      const result = testHelper.totalLikes(blogsDummy);
      expect(result).toBe(36);
    });

    test('favourite blog', () => {
      const { title, author, likes } = testHelper.favoriteBlog(blogsDummy);
      expect({ title, author, likes }).toStrictEqual({ title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 });
    });

    test('most blogs', () => {
      const { author, blogs } = testHelper.mostBlogs(blogsDummy);
      expect({ author, blogs }).toStrictEqual({ author: 'Robert C. Martin', blogs: 3 });
    });

    test('most likes', () => {
      const { author, likes } = testHelper.mostLikes(blogsDummy);
      expect({ author, likes }).toStrictEqual({ author: 'Edsger W. Dijkstra', likes: 17 });
    });
  });

  describe('reading blog posts', () => {
    test('amount of initial remote blogs equals amount of local dummy blogs', async () => {
      const blogs = await testHelper.blogsInDb();
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
      const currentBlogPosts = await testHelper.blogsInDb();
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

      const updatedBlogPosts = await testHelper.blogsInDb();
      const latestBlogPost = await Blog.findById(response.body.id);
      const {
        title, author, url, likes,
      } = latestBlogPost;

      expect(updatedBlogPosts.length).toEqual(currentBlogPosts.length + 1);
      expect({
        title, author, url, likes,
      }).toStrictEqual({
        title: newBlogPost.title,
        author: newBlogPost.author,
        url: newBlogPost.url,
        likes: newBlogPost.likes,
      });

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
};

module.exports = blogsTests;
