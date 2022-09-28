const { info } = require('./logger');

const requestLogger = (request, response, next) => {
  info('Method:', request.method);
  info('Path:  ', request.path);
  info('Body:  ', request.body);
  info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: { message: 'unknown endpoint' } });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  switch (err.name) {
    case 'CastError':
      res.status(400).json({ error: { message: 'Malformatted id!' } });
      break;

    case 'ValidationError':
      res.status(400).json({ error: err.errors[Object.keys(err.errors).pop()] });
      break;

    default:
      res.status(500).send('Something broke!');
  }
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
