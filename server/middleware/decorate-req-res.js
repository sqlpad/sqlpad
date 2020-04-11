function decorateReqRes(config, models, appLog) {
  return function(req, res, next) {
    req.config = config;
    req.models = models;
    req.appLog = appLog;

    res.errors = (data, httpStatusCode) => {
      if (!httpStatusCode) {
        return next(new Error('res.errors missing status code'));
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
      return res.status(httpStatusCode).json({ errors });
    };

    res.data = data => {
      return res.json({ data: data || null });
    };

    res.updateNotFound = () => {
      return res.status(404).json({ errors: [{ title: 'Not found' }] });
    };

    next();
  };
}

module.exports = decorateReqRes;
