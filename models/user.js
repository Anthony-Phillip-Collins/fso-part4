const { Schema, model } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const schemaToJSON = require('../utils/schemaToJSON');

const userSchema = new Schema({
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
  blogs: [{
    type: Schema.Types.ObjectId,
    ref: 'Blog',
  }],
});

userSchema.plugin(uniqueValidator, {
  message: '{VALUE} already exists. The {PATH} has to be {TYPE}.',
});

schemaToJSON(userSchema, (returnedObject) => {
  // eslint-disable-next-line no-param-reassign
  // delete returnedObject.hashedPassword;
});

const User = model('User', userSchema);

module.exports = User;
