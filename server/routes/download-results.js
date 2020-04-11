const fs = require('fs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

router.get(
  '/download-results/:cacheKey.csv',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models, config } = req;
    const { cacheKey } = req.params;
    if (!config.get('allowCsvDownload')) {
      return res.utils.errors('Result downloads disabled', 403);
    }

    const cache = await models.resultCache.findOneByCacheKey(cacheKey);
    if (!cache) {
      return res.utils.errors('Result not found', 404);
    }
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
  wrap(async function(req, res) {
    const { models, config } = req;
    const { cacheKey } = req.params;
    if (!config.get('allowCsvDownload')) {
      return res.utils.errors('Result downloads disabled', 403);
    }

    const cache = await models.resultCache.findOneByCacheKey(cacheKey);
    if (!cache) {
      return res.utils.errors('Result not found', 404);
    }
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
  wrap(async function(req, res) {
    const { models, config } = req;
    const { cacheKey } = req.params;
    if (!config.get('allowCsvDownload')) {
      return res.utils.errors('Result downloads disabled', 403);
    }

    const cache = await models.resultCache.findOneByCacheKey(cacheKey);
    if (!cache) {
      return res.utils.errors('Result not found', 404);
    }
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
