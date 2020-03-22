const appLog = require('./app-log');

/**
 * Logs actual error and sends standard error response
 * @param {*} res
 * @param {Error} [error]
 * @param {string} [message]
 */
module.exports = function sendError(res, error, message) {
  if (error) {
    appLog.error(error);
  }
  return res.json({
    error: message || (error ? error.toString() : 'Something happened')
  });
};
