var _ = require('lodash');
var router = require('express').Router();
var Query = require('../models/Query.js');

router.get('/tags', function (req, res) {
    Query.findAll(function (err, queries) {
        var tags = _.uniq(_.flatten(_.map(queries, 'tags'))).sort();
        res.json(tags);
    });
});

module.exports = router;