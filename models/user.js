const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schemaIdToString = require('../utils/schemaIdToString');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: [3, 'The username has to be at least 3 characters long!'],
    unique: true,
  },
  name: {
    type: String,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator, {
  message: '{VALUE} already exists. The {PATH} has to be {TYPE}.',
});

schemaIdToString(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;
