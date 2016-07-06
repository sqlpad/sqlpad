module.exports = function (app, router) {

    var db = app.get('db');
    var baseUrl = app.get('baseUrl')

    router.get('/react-hello-world', function (req, res) {
        db.config.find({}).exec(function (err, configItems) {
            if (err) {
                res.send({
                    success: false,
                    error: err.toString()
                });
            } else {
                res.render('react-hello-world', {configItems: configItems, pageTitle: "React Hello world"});
            }
        });
    });
    
    /*
    router.get('/configs/:_id', function (req, res) {
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

    router.post('/configs/new', function (req, res) {
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
                res.redirect(baseUrl + '/configs');
            }
        });
    });

    router.put('/configs/:_id', function (req, res) {
        var bodyConfig = {
            value: req.body.value,
            modifiedDate: new Date()
        };

        db.config.findOne({_id: req.params._id}, function (err, dbconfig) {
            _.merge(dbconfig, bodyConfig);
            dbconfig.modifiedDate = new Date();
            db.config.update({_id: req.params._id}, dbconfig, {}, function (err) {
                if (err) console.log(err);
                res.redirect(baseUrl + '/configs');
            });
        });
    });

    router.delete('/configs/:_id', function (req, res) {
        db.config.remove({_id: req.params._id}, function (err) {
            if (err) console.log(err);
            res.redirect(baseUrl + '/configs');
        });
    });
    */
};
