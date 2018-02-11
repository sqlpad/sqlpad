var fs = require('fs')
var router = require('express').Router()
var Cache = require('../models/Cache.js')

router.get('/download-results/:cacheKey.csv', function(req, res, next) {
  const { config } = req

  if (config.get('allowCsvDownload')) {
    Cache.findOneByCacheKey(req.params.cacheKey, function(err, cache) {
      if (err) {
        console.error(err)
        return next(err)
      }
      if (!cache) {
        return next(new Error('Cache not found'))
      }
      var filename = cache.queryName + '.csv'
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      )
      res.setHeader('Content-Type', 'text/csv')
      fs.createReadStream(cache.csvFilePath()).pipe(res)
    })
  }
})

router.get('/download-results/:cacheKey.xlsx', function(req, res, next) {
  const { config } = req

  if (config.get('allowCsvDownload')) {
    Cache.findOneByCacheKey(req.params.cacheKey, function(err, cache) {
      if (err) {
        console.error(err)
        return next(err)
      }
      if (!cache) {
        return next(new Error('Cache not found'))
      }
      var filename = cache.queryName + '.xlsx'
      res.setHeader(
        'Content-disposition',
        'attachment; filename="' + encodeURIComponent(filename) + '"'
      )
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      fs.createReadStream(cache.xlsxFilePath()).pipe(res)
    })
  }
})

module.exports = router
