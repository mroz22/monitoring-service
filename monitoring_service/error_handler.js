const { HttpError, InternalServerError } = require('restify-errors');
const logger = require('./logger');

/*
  expected errors from 4xx family errors are always thrown using 'restify-errors' classes
  this function decides, if the error is expected one.
  If not, it should be considered Internal server error.
 */

module.exports = function (err) {
  logger.error(err);
  if (err instanceof HttpError) {
    return err;
  }
  return new InternalServerError(err.message, err);
};
