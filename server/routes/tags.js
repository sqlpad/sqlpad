const _ = require('lodash');
const router = require('express').Router();
const getModels = require('../models');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

router.get('/api/tags', mustBeAuthenticated, async function(req, res) {
  try {
    const models = getModels(req.nedb);
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
