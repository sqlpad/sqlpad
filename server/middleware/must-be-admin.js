import mustBeAuthenticated from './must-be-authenticated.js';

export default [
  mustBeAuthenticated,
  function mustBeAdmin(req, res, next) {
    if (req.user.role === 'admin') {
      return next();
    }
    return res.utils.forbidden();
  },
];
