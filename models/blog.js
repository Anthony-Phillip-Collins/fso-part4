const { Schema, model } = require('mongoose');
const schemaToJSON = require('../utils/schemaToJSON');

const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

schemaToJSON(blogSchema);

const Blog = model('Blog', blogSchema);

module.exports = Blog;
