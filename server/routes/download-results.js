const fs = require('fs');
const router = require('express').Router();

router.get('/download-results/:cacheKey.csv', async function(req, res, next) {
  const { models, appLog } = req;
  const { cacheKey } = req.params;
  try {
    if (req.config.get('allowCsvDownload')) {
      const cache = await models.resultCache.findOneByCacheKey(cacheKey);
      if (!cache) {
        return next(new Error('Result cache not found'));
      }
      let filename = cache.queryName + '.csv';
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      );
      res.setHeader('Content-Type', 'text/csv');
      fs.createReadStream(models.resultCache.csvFilePath(cacheKey)).pipe(res);
    } else {
      return next(new Error('CSV download disabled'));
    }
  } catch (error) {
    appLog.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

router.get('/download-results/:cacheKey.xlsx', async function(req, res, next) {
  const { models, appLog } = req;
  const { cacheKey } = req.params;
  try {
    if (req.config.get('allowCsvDownload')) {
      const cache = await models.resultCache.findOneByCacheKey(cacheKey);
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
      fs.createReadStream(models.resultCache.xlsxFilePath(cacheKey)).pipe(res);
    } else {
      return next(new Error('XLSX download disabled'));
    }
  } catch (error) {
    appLog.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

router.get('/download-results/:cacheKey.json', async function(req, res, next) {
  const { models, appLog } = req;
  const { cacheKey } = req.params;
  try {
    if (req.config.get('allowCsvDownload')) {
      const cache = await models.resultCache.findOneByCacheKey(cacheKey);
      if (!cache) {
        return next(new Error('Result cache not found'));
      }
      let filename = cache.queryName + '.json';
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      );
      res.setHeader('Content-Type', 'application/json');
      fs.createReadStream(models.resultCache.jsonFilePath(cacheKey)).pipe(res);
    } else {
      return next(new Error('JSON download disabled'));
    }
  } catch (error) {
    appLog.error(error);
    // TODO figure out what this sends and set manually
    return next(error);
  }
});

module.exports = router;
