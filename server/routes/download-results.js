const fs = require('fs');
const router = require('express').Router();
const Cache = require('../models/Cache.js');

router.get('/download-results/:cacheKey.csv', async function(req, res, next) {
  try {
    const { config } = req;
    if (config.get('allowCsvDownload')) {
      const cache = await Cache.findOneByCacheKey(req.params.cacheKey);
      if (!cache) {
        return next(new Error('Cache not found'));
      }
      let filename = cache.queryName + '.csv';
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      );
      res.setHeader('Content-Type', 'text/csv');
      fs.createReadStream(cache.csvFilePath()).pipe(res);
    }
  } catch (error) {
    console.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

router.get('/download-results/:cacheKey.xlsx', async function(req, res, next) {
  try {
    const { config } = req;
    if (config.get('allowCsvDownload')) {
      const cache = await Cache.findOneByCacheKey(req.params.cacheKey);
      if (!cache) {
        return next(new Error('Cache not found'));
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
      fs.createReadStream(cache.xlsxFilePath()).pipe(res);
    }
  } catch (error) {
    console.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

module.exports = router;
