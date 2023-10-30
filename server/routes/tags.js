import '../typedefs.js';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listTags(req, res) {
  const tags = await req.models.tags.findDistinctTags();
  return res.utils.data(tags);
}

router.get('/api/tags', mustBeAuthenticated, wrap(listTags));

export default router;
