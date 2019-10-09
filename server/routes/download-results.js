const fs = require('fs');
const router = require('express').Router();
const resultCache = require('../models/resultCache.js');
const config = require('../lib/config');

router.get('/download-results/:cacheKey.csv', async function(req, res, next) {
  const { cacheKey } = req.params;
  try {
    if (config.get('allowCsvDownload')) {
      const cache = await resultCache.findOneByCacheKey(cacheKey);
      if (!cache) {
        return next(new Error('Result cache not found'));
      }
      let filename = cache.queryName + '.csv';
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      );
      res.setHeader('Content-Type', 'text/csv');
      fs.createReadStream(resultCache.csvFilePath(cacheKey)).pipe(res);
    } else {
      return next(new Error('CSV download disabled'));
    }
  } catch (error) {
    console.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

router.get('/download-results/:cacheKey.xlsx', async function(req, res, next) {
  const { cacheKey } = req.params;
  try {
    if (config.get('allowCsvDownload')) {
      const cache = await resultCache.findOneByCacheKey(cacheKey);
      if (!cache) {
        return next(new Error('Result cache not found'));
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
      fs.createReadStream(resultCache.xlsxFilePath(cacheKey)).pipe(res);
    } else {
      return next(new Error('XLSX download disabled'));
    }
  } catch (error) {
    console.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

module.exports = router;
