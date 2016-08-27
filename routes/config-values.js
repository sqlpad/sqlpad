var ConfigItem = require('../models/ConfigItem.js');
var config = require('../lib/config.js');
var router = require('express').Router();

router.get('/api/config', function (req, res) {
    res.json({
        err: null,
        config: config.getAllValues()
    });
})

router.get('/api/config-items', function (req, res) {
    var configItems = ConfigItem.findAll();
    res.json({
        configItems: configItems
    });
})

router.post('/api/config-values/:key', function (req, res) {
    var key = req.params.key;
    var value = req.body.value;
    var configItem = ConfigItem.findOneByKey(key);
    configItem.setDbValue(value);
    configItem.save(function (err) {
        if (err) return res.json({error: err});
        return res.json({success: true});
    });
})

router.get('/config-values', function (req, res) {
    return res.render('react-applet', {
        pageTitle: "Configuration"
    });
});

module.exports = router;