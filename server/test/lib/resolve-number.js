const assert = require('assert');
const {
  resolveNumber,
  resolvePositiveNumber,
} = require('../../lib/resolve-number');

describe('lib/resolve-number', function () {
  it('resolveNumber: if given parameter is a number, return number otherwise return a default value', function () {
    assert.equal(resolveNumber(undefined, 100), 100);
    assert.equal(resolveNumber(null, 100), 100);
    assert.equal(resolveNumber('1', 100), 1);
    assert.equal(resolveNumber(-1, 100), -1);
    assert.equal(resolveNumber(1, 100), 1);
    assert.equal(resolveNumber(Infinity, 100), 100);
    assert.equal(resolveNumber(-Infinity, 100), 100);
    assert.equal(resolveNumber(0, 100), 0);
  });
});

describe('lib/resolve-positive-number', function () {
  it('resolvePostiveNumber: if given parameter is a positive number, return number otherwise return a default value', function () {
    assert.equal(resolvePositiveNumber(undefined, 100), 100);
    assert.equal(resolvePositiveNumber(null, 100), 100);
    assert.equal(resolvePositiveNumber('1', 100), 1);
    assert.equal(resolvePositiveNumber(-1, 100), 100);
    assert.equal(resolvePositiveNumber(1, 100), 1);
    assert.equal(resolvePositiveNumber(Infinity, 100), 100);
    assert.equal(resolvePositiveNumber(-Infinity, 100), 100);
    assert.equal(resolvePositiveNumber(0, 100), 100);
  });
});
