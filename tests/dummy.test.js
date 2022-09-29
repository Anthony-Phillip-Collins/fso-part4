const listHelper = require('../utils/list_helper');
const dummyBlogs = require('./dummyBlogs');

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
});
