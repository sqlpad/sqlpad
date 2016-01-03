var formattor = require("formattor");

module.exports = function (app) {
    app.post('/beautiSql', function (req, res) {
        var sql = req.body.queryText;
        var options = {method: 'sql'};
        sql = formattor(sql, options);
        res.json(sql);
    });
}