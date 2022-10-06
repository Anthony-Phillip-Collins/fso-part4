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

    case 'JsonWebTokenError':
      res.status(401).json({ error: { message: 'token missing or invalid' } });
      break;

    default:
      res.status(500).send('Something broke!');
  }
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  const authenticationScheme = 'bearer ';
  if (authorization && authorization.toLowerCase().startsWith(authenticationScheme)) {
    request.token = authorization.substring(authenticationScheme.length);
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
};
