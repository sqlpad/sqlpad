var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('lodash');

describe('lib/config.js', function() {
    
    // set any process.env variables here
    // or any process.env.args
    process.argv.push('--debug');
    process.env.SQLPAD_DEBUG = "FALSE";
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    var config = require('../../lib/config.js');
    var configItems = require('../../lib/config-items.js');
    var configItemsByKey = _.indexBy(configItems, 'key');

    describe('#set()', function() {
        it('should accept key, value, setBy', function() {
            config.set('ip', '127.0.0.1', 'testing');
        })
        it('setBy should be optional', function () {
            config.set('ip', '127.0.0.1');
        })
        it('should only accept key in config items', function () {
            var fn = function () {
                config.set('non-existent-key', 'value')
            }
            fn.should.throw(Error)
        })
        it('should convert string boolean text to actual boolean', function () {
            config.set('disableUserpassAuth', 'true');
            config.get('disableUserpassAuth').should.equal(true);
        })
    })

    describe('#get()', function () {
        it('should get a value for given key', function () {
            config.set('ip', '127.0.0.1');
            config.get('ip').should.equal('127.0.0.1');
        })
        it('should only accept key in config items', function () {
            var fn = function () {
                config.get('non-existent-key');
            }
            fn.should.throw(Error);
        })
        
    })

    describe('init logic', function () {

        it('should honor default defined in toml', function () {
            var tomlDefault = configItemsByKey['passphrase'].default;
            var configValue = config.get('passphrase');
            configValue.should.equal(tomlDefault);
        })

        it('env should override default', function () {
            config.get('googleClientId').should.equal('google-client-id')
        })

        it('cli param should override default and env', function () {
            var debug = config.get('debug');
            debug.should.equal(true);
        })
    })
})