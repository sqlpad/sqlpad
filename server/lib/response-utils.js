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
   * If `id` is not present and `_id` is, `id` will be populated with `_id` value
   * @param {(object|object[])} [data] - data to send to client
   */
  data(data) {
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (!item.id && item._id) {
          item.id = item._id;
        }
      });
    } else if (data && data._id && !data.id) {
      data.id = data._id;
    }

    return this.res.json({ data: data || null });
  }

  /**
   * Send error responses to client using status code
   * @param {*} data
   * @param {number} httpStatusCode
   */
  errors(data, httpStatusCode) {
    if (!httpStatusCode) {
      return this.next(new Error('res.errors missing status code'));
    }
    let errors = [];
    if (Array.isArray(data)) {
      errors = data;
    } else {
      errors.push(data);
    }
    // Ensure errors are objects with a title property
    errors = errors.map(e => {
      if (typeof e === 'string') {
        return { title: e };
      }
      if (e instanceof Error) {
        const title = e.message || e.toString();
        return { title };
      }
      if (e.title) {
        return e;
      }
      return { title: 'Something happened' };
    });
    return this.res.status(httpStatusCode).json({ errors });
  }

  /**
   * Send a 404 with an error object
   */
  updateNotFound() {
    return this.errors('Not found', 404);
  }

  /**
   * Send a 200 null data response for get /item/<id> that doesn't exist
   */
  getNotFound() {
    return this.data();
  }

  /**
   * Send a 404 with an error object
   */
  deleteNotFound() {
    return this.errors('Not found', 404);
  }

  /**
   * Send a 200 with a meta object
   */
  deleteOk() {
    return this.res.json({ meta: null });
  }

  /**
   * User is not authenticated
   * @param {String} [detail] - optional message to include in detail property
   */
  unauthorized(detail) {
    const error = {
      title: 'Unauthorized'
    };
    return this.errors({ ...error, detail }, 401);
  }

  /**
   * For when request was understood, and user is authenticated,
   * but user is not allowed to perform the action
   */
  forbidden() {
    return this.errors('Forbidden', 403);
  }
}

module.exports = ResponseUtils;
