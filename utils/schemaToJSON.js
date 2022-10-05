module.exports = (schema, callback) => {
  schema.set('toJSON', {
    transform: (document, returnedObject) => {
      // eslint-disable-next-line no-param-reassign, no-underscore-dangle
      returnedObject.id = returnedObject._id.toString();
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      delete returnedObject._id;
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      delete returnedObject.__v;
      if (callback) callback(returnedObject);
    },
  });
};
