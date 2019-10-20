const logger = require('./logger');

/**
 * Logs actual error to console and sends standard error response
 * @param {*} res
 * @param {Error} [error]
 * @param {string} [message]
 */
module.exports = function sendError(res, error, message) {
  msg = message || (error ? error.toString() : 'Something happened');
  if (error) {
    logger.error({ err: error }, msg);
  }
  return res.json({
    error: msg
  });
};
