var ConfigItem = require('../models/ConfigItem.js');
var config = require('../lib/config.js');
var router = require('express').Router();
var mustBeAdmin = require('../middleware/must-be-admin.js');
var _ = require('lodash');

router.get('/api/config', function (req, res) {
    return res.json({
        config: config.getAllValues()
    });
})

router.get('/api/config-items', function (req, res) {
    var configItems = _.cloneDeep(ConfigItem.findAll());
    configItems = configItems.map(function (item) {
        if (item.sensitive) {
            item.effectiveValue = '**********';
            item.dbValue = '**********';
            item.default = '**********';
            item.envValue = '**********';
            item.cliValue = '**********';
            item.savedCliValue = '**********';
        }
        return item;
    });
    return res.json({
        configItems: configItems
    });
})

router.post('/api/config-values/:key', mustBeAdmin, function (req, res) {
    var key = req.params.key;
    var value = req.body.value;
    var configItem = ConfigItem.findOneByKey(key);
    configItem.setDbValue(value);
    configItem.save(function (err) {
        if (err) {
            console.error(err);
            return res.json({
                error: "Problem saving config value"
            });
        }
        return res.json({});
    });
})

router.get('/config-values', mustBeAdmin, function (req, res) {
    return res.render('react-applet', {
        pageTitle: "Configuration"
    });
});

module.exports = router;