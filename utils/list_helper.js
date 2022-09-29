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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
