const fs = require('fs')
const router = require('express').Router()
const Cache = require('../models/Cache.js')

router.get('/download-results/:cacheKey.csv', function(req, res, next) {
  const { config } = req
  if (config.get('allowCsvDownload')) {
    return Cache.findOneByCacheKey(req.params.cacheKey)
      .then(cache => {
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
      .catch(error => {
        console.error(error)
        // TODO figure out what this sends and set manually
        return next(error)
      })
  }
})

router.get('/download-results/:cacheKey.xlsx', function(req, res, next) {
  const { config } = req
  if (config.get('allowCsvDownload')) {
    return Cache.findOneByCacheKey(req.params.cacheKey)
      .then(cache => {
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
      .catch(error => {
        console.error(error)
        // TODO figure out what this sends and set manually
        return next(error)
      })
  }
})

module.exports = router
