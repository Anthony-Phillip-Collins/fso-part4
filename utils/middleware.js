const jwt = require('jsonwebtoken');
const ErrorName = require('../enums/ErrorName');
const User = require('../models/user');
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
const errorHandler = (error, request, response, next) => {
  switch (error.name) {
    case ErrorName.NotFound:
      response.status(404).json({ error: { message: 'The requested resource doesn’t exists!' } });
      break;
    case ErrorName.CastError:
      response.status(400).json({ error: { message: 'Malformatted id!' } });
      break;
    case ErrorName.ValidationError:
      response.status(400).json({ error: error.errors[Object.keys(error.errors).pop()] });
      break;
    case ErrorName.JsonWebTokenError:
      response.status(401).json({ error: { message: 'token missing or invalid' } });
      break;
    case ErrorName.AccessDenied:
      response.status(403).json({ error: { message: 'User doesn’t have permissions to perform this action.' } });
      break;
    default:
      response.status(500).send(error.message || 'Something broke!');
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

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  request.user = await User.findById(decodedToken.id);
  if (!request.user) {
    next({ name: ErrorName.AccessDenied });
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
