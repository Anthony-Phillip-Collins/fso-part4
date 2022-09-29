const dummy = (blogs) => (blogs ? 1 : 0);

const totalLikes = (blogs) => {
  const reducer = (sum, { likes }) => sum + likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (blogA, blogB) => {
    const prev = blogA || blogB;
    const { title, author, likes } = blogB.likes > prev.likes ? blogB : prev;
    return { title, author, likes };
  };
  return blogs.reduce(reducer);
};

const mostBlogs = (blogs) => {
  const authorsReducer = (authors, blog) => {
    const exists = authors.find(({ author }) => author === blog.author);
    if (!exists) {
      authors.push({ author: blog.author, blogs: 1 });
    } else {
      exists.blogs += 1;
    }
    return authors;
  };

  const authors = blogs.reduce(authorsReducer, []);
  return authors.sort((a, b) => b.blogs - a.blogs)[0];
};

const mostLikes = (blogs) => {
  const authorsReducer = (authors, blog) => {
    const exists = authors.find(({ author }) => author === blog.author);
    if (!exists) {
      authors.push({ author: blog.author, likes: blog.likes });
    } else {
      exists.likes += blog.likes;
    }
    return authors;
  };

  const authors = blogs.reduce(authorsReducer, []);
  return authors.sort((a, b) => b.likes - a.likes)[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
