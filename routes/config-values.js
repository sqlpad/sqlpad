var ConfigValue = require('../models/ConfigValue.js');
var configItems = require('../lib/config-items.js');
var config = require('../lib/config.js');
var router = require('express').Router();

router.get('/api/config-items', function (req, res) {
    var setBys = config.getAllSetBy();
    var withValues = configItems.map(function (item) {
        item.value = config.get(item.key);
        item.setBy = setBys[item.key];
        return item;
    })
    res.json(withValues);
})

router.post('/api/config-values/:key', function (req, res) {
    var key = req.params.key;
    var value = req.body.value;
    ConfigValue.findByKey(key, function (err, configValue) {
        if (err) {
            res.statusCode = 500;
            return res.json({
                error: "Could not save ConfigValue to database"
            });
        }
        if (!configValue) {
            configValue = new ConfigValue({
                key: key
            });
        }
        configValue.set('value', value);
        configValue.save(function (err) {
            if (err) {
                res.statusCode = 500;
                return res.json({error: err});
            }
            return res.json({success: true});
        })
    })
})

router.get('/config-values', function (req, res) {
    res.render('config-values', {
        pageTitle: "Configuration"
    });
});

module.exports = router;