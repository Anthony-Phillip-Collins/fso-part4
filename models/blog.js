const mongoose = require('mongoose');
const schemaIdToString = require('../utils/schemaIdToString');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

schemaIdToString(blogSchema);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
