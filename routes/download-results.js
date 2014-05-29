var path = require('path');
var fs = require('fs');

module.exports = function (app) {
    app.get('/download-results/:cacheKey.csv', function (req, res) {
        res.setHeader('Content-disposition', 'attachment; filename=results.csv');
        res.setHeader('Content-Type', 'text/csv');
        var csvPath = path.join(app.get('dbPath'), "/cache/", req.params.cacheKey + ".csv");
        fs.createReadStream(csvPath).pipe(res);
    });
};