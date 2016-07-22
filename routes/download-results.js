var path = require('path');
var fs = require('fs');
var router = require('express').Router();
var db = require('../lib/db.js');
var config = require('../lib/config.js');

router.get('/download-results/:cacheKey.csv', function (req, res) {
    if (config.get('allowCsvDownload')) {
        db.cache.findOne({cacheKey: req.params.cacheKey}, function (err, cache) {
            if (err) console.log(err);
            var filename = cache.queryName + ".csv";
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-Type', 'text/csv');
            var csvPath = path.join(config.get('dbPath'), "/cache/", req.params.cacheKey + ".csv");
            fs.createReadStream(csvPath).pipe(res);
        });
    }
});

router.get('/download-results/:cacheKey.xlsx', function (req, res) {
    if (config.get('allowCsvDownload')) {
        db.cache.findOne({cacheKey: req.params.cacheKey}, function (err, cache) {
            if (err) console.log(err);
            var filename = cache.queryName + ".xlsx";
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            var xlsxPath = path.join(config.get('dbPath'), "/cache/", req.params.cacheKey + ".xlsx");
            fs.createReadStream(xlsxPath).pipe(res);
        });
    }
});

module.exports = router;