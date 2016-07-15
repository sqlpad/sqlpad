var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('lodash');

describe('models/ConfigValue.js', function() {
    
    //var config = require('../../lib/config.js');
    //var configItems = require('../../lib/config-items.js');
    //var configItemsByKey = _.indexBy(configItems, 'key');

    var ConfigValue = require('../../models/ConfigValue.js');

    beforeEach(function beforeEach (done) {
        ConfigValue._removeAll(function (err) {
            var configValue = new ConfigValue({_id: 'ip', key: 'ip', value: 'ip'})
            configValue.save(done);    
        });
    })

    describe('new ConfigValue()', function () {
        var configValue = new ConfigValue({_id: 'port', key: 'port', value: 'port'})

        it('should set a property value', function () {
            configValue.set('value', 'new-port')
        })

        it('should get a property value', function () {
            var propVal = configValue.get('value');
            propVal.should.equal('new-port')
        })

        it('should save without error', function (done) {
            configValue.save(function (err) {
                should.not.exist(err);
                done();
            })
        })
    })

    describe('.findById()', function () {
        it('should get a ConfigValue by id', function (done) {
            ConfigValue.findById('ip', function(err, configValue) {
                should.not.exist(err)
                should.exist(configValue)
                expect(configValue).to.be.an.instanceof(ConfigValue);
                expect(configValue.get('value')).to.equal('ip');
                done();
            })
        })
    })

    describe('.findAll()', function () {
        it('should get all the config values', function (done) {
            ConfigValue.findAll(function (err, configValues) {
                should.not.exist(err)
                should.exist(configValues)
                configValues.should.have.lengthOf(1)
                expect(configValues[0]).to.be.an.instanceof(ConfigValue)
                done()
            })
        })
    })
})