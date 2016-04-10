var path = require('path');
var fs = require('fs');

module.exports = function (app, router) {
    var db = app.get('db');
    router.get('/download-results/:cacheKey.csv', function (req, res) {

        db.config.findOne({key: "allowCsvDownload"}, function (err, config) {
            if (err) {
                console.log(err);
            }

            /**
             * Either the config key doesn't exist, or it is explicitly set to false
             */
            var preventDownload = config && config.value === "false";

            if (!preventDownload) {
                db.cache.findOne({cacheKey: req.params.cacheKey}, function (err, cache) {
                    if (err) console.log(err);
                    var filename = cache.queryName + ".csv";
                    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
                    res.setHeader('Content-Type', 'text/csv');
                    var csvPath = path.join(app.get('dbPath'), "/cache/", req.params.cacheKey + ".csv");
                    fs.createReadStream(csvPath).pipe(res);
                });
            }
        });
    });
    
    router.get('/download-results/:cacheKey.xlsx', function (req, res) {

        db.config.findOne({key: "allowCsvDownload"}, function (err, config) {
            if (err) {
                console.log(err);
            }

            /**
             * Either the config key doesn't exist, or it is explicitly set to false
             */
            var preventDownload = config && config.value === "false";

            if (!preventDownload) {
                db.cache.findOne({cacheKey: req.params.cacheKey}, function (err, cache) {
                    if (err) console.log(err);
                    var filename = cache.queryName + ".xlsx";
                    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    var xlsxPath = path.join(app.get('dbPath'), "/cache/", req.params.cacheKey + ".xlsx");
                    fs.createReadStream(xlsxPath).pipe(res);
                });
            }
        });
    });
};
