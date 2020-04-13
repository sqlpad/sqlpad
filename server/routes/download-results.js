const fs = require('fs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

async function getCache(req, res, next) {
  const { models, config } = req;
  const { cacheKey } = req.params;
  if (!config.get('allowCsvDownload')) {
    // This is not an `/api/` route returning JSON, so just send standard status
    return res.sendStatus(403);
  }

  const cache = await models.resultCache.findOneByCacheKey(cacheKey);
  if (!cache) {
    // This is not an `/api/` route returning JSON, so just send standard status
    return res.sendStatus(404);
  }

  req.cache = cache;

  next();
}

router.get(
  '/download-results/:cacheKey.csv',
  mustBeAuthenticated,
  wrap(getCache),
  wrap(async function(req, res) {
    const { models, cache } = req;
    const { cacheKey } = req.params;

    let filename = cache.queryName + '.csv';
    res.setHeader(
      'Content-disposition',
      'attachment; filename="' + encodeURIComponent(filename) + '"'
    );
    res.setHeader('Content-Type', 'text/csv');
    fs.createReadStream(models.resultCache.csvFilePath(cacheKey)).pipe(res);
  })
);

router.get(
  '/download-results/:cacheKey.xlsx',
  mustBeAuthenticated,
  wrap(getCache),
  wrap(async function(req, res) {
    const { models, cache } = req;
    const { cacheKey } = req.params;

    let filename = cache.queryName + '.xlsx';
    res.setHeader(
      'Content-disposition',
      'attachment; filename="' + encodeURIComponent(filename) + '"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    fs.createReadStream(models.resultCache.xlsxFilePath(cacheKey)).pipe(res);
  })
);

router.get(
  '/download-results/:cacheKey.json',
  mustBeAuthenticated,
  wrap(getCache),
  wrap(async function(req, res) {
    const { models, cache } = req;
    const { cacheKey } = req.params;

    let filename = cache.queryName + '.json';
    res.setHeader(
      'Content-disposition',
      'attachment; filename="' + encodeURIComponent(filename) + '"'
    );
    res.setHeader('Content-Type', 'application/json');
    fs.createReadStream(models.resultCache.jsonFilePath(cacheKey)).pipe(res);
  })
);

module.exports = router;
