const _ = require('lodash');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

router.get('/api/tags', mustBeAuthenticated, async function(req, res) {
  const { models } = req;
  try {
    const queries = await models.queries.findAll();
    const tags = _.uniq(_.flatten(_.map(queries, 'tags')))
      .sort()
      .filter(t => t);

    return res.json({
      tags
    });
  } catch (error) {
    sendError(res, error, 'Problem getting tags');
  }
});

module.exports = router;
