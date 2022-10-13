const ErrorName = Object.freeze({
  NotFound: 'NotFound',
  CastError: 'CastError',
  ValidationError: 'ValidationError',
  JsonWebTokenError: 'JsonWebTokenError',
  Unauthorized: 'Unauthorized',
  NotInTestMode: 'NotInTestMode',
});

module.exports = ErrorName;
