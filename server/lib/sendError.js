/**
 * Logs actual error to console and sends standard error response
 * @param {*} res
 * @param {Error} [error]
 * @param {string} [message]
 */
module.exports = function sendError(res, error, message) {
  if (error) {
    console.error(error);
  }
  return res.json({
    error: message || (error ? error.toString() : 'Something happened')
  });
};
