require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listTags(req, res) {
  const tags = await req.models.tags.findDistinctTags();
  return res.utils.data(tags);
}

router.get('/api/tags', mustBeAuthenticated, wrap(listTags));

module.exports = router;
