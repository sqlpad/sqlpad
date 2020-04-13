const _ = require('lodash');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

router.get(
  '/api/tags',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models } = req;
    const queries = await models.queries.findAll();
    const tags = _.uniq(_.flatten(_.map(queries, 'tags')))
      .sort()
      .filter(t => t);

    return res.utils.data(tags);
  })
);

module.exports = router;
