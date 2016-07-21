var _ = require('lodash');
var db = require('../lib/db.js');

module.exports = function (app, router) {
    router.get('/tags', function (req, res) {
        db.queries.find({}, function (err, queries) {
            var tags = _.uniq(_.flatten(_.map(queries, 'tags'))).sort();
            res.json(tags);
        });
    });
};
