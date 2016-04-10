var _ = require('lodash');

module.exports = function (app, router) {

    var db = app.get('db');
    
    router.get('/tags', function (req, res) {
        db.queries.find({}, function (err, queries) {
            var tags = _.uniq(_.flatten(_.map(queries, 'tags'))).sort();
            res.json(tags);
        });
    });

};
