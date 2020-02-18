const logger = require('./logger');

/**
 * Logs actual error and sends standard error response
 * @param {*} res
 * @param {Error} [error]
 * @param {string} [message]
 */
module.exports = function sendError(res, error, message) {
  if (error) {
    logger.error(error);
  }
  return res.json({
    error: message || (error ? error.toString() : 'Something happened')
  });
};
