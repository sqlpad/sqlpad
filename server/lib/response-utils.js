/**
 * A collection of utilities to send a variety of responses to client.
 */
class ResponseUtils {
  constructor(res, next) {
    this.res = res;
    this.next = next;
  }

  /**
   * Send data response to client
   * @param {(object|object[])} [data] - data to send to client
   */
  data(data) {
    return this.res.json(data || {});
  }

  /**
   * Send a 400 error response to client.
   * Derives error object from data passed in
   * @param {(string|Error|object)} data - string, Error, or preformed object
   */
  error(data) {
    const error = {};

    // Populate error object from data passed in
    if (typeof data === 'string') {
      error.title = data;
    } else if (data instanceof Error) {
      error.title = data.message || data.toString();
    } else if (typeof data === 'object') {
      Object.assign(error, data);
    } else {
      throw new Error('Unexpected error data');
    }

    return this.res.status(400).json(error);
  }

  /**
   * Send a 404 with an error object
   */
  notFound() {
    this.res.status(404).json({ title: 'Not found' });
  }

  /**
   * User is not authenticated
   * @param {String} [detail] - optional message to include in detail property
   */
  unauthorized(detail) {
    const error = {
      title: 'Unauthorized',
      detail,
    };
    return this.res.status(401).json(error);
  }

  /**
   * For when request was understood, and user is authenticated,
   * but user is not allowed to perform the action
   */
  forbidden() {
    const error = {
      title: 'Forbidden',
    };
    return this.res.status(403).json(error);
  }
}

module.exports = ResponseUtils;
