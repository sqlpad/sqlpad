var _ = require('lodash');

module.exports = function (app) {

    var db = app.get('db');

    app.get('/configs', function (req, res) {
        db.config.find({}).exec(function (err, configItems) {

            if (err) {
                res.send({
                    success: false,
                    error: err.toString()
                });
            } else {

                res.render('configs', {configItems: configItems, pageTitle: "Configuration"});
            }
        });
    });

    app.get('/configs/:_id', function (req, res) {
        db.config.findOne({_id: req.params._id}, function (err, config) {
            if (!config) {
                config = {
                    key: '',
                    value: '',
                    createdDate: null,
                    modifiedDate: null
                };
            }
            res.render('config', {
                config: config
            });
        });
    });

    app.post('/configs/new', function (req, res) {
        var config = {
            key: req.body.key,
            value: req.body.value,
            createdDate: new Date(),
            modifiedDate: new Date()
        };

        db.config.insert(config, function (err) {
            if (err) {
                console.log(err);
                res.render('config', {config: config, debug: err});
            } else {
                res.redirect('/configs');
            }
        });
    });

    app.put('/configs/:_id', function (req, res) {
        var bodyConfig = {
            value: req.body.value,
            modifiedDate: new Date()
        };

        db.config.findOne({_id: req.params._id}, function (err, dbconfig) {
            _.merge(dbconfig, bodyConfig);
            dbconfig.modifiedDate = new Date();
            db.config.update({_id: req.params._id}, dbconfig, {}, function (err) {
                if (err) console.log(err);
                res.redirect('/configs');
            });
        });
    });

    app.delete('/configs/:_id', function (req, res) {
        db.config.remove({_id: req.params._id}, function (err) {
            if (err) console.log(err);
            res.redirect('/configs');
        });
    });
};