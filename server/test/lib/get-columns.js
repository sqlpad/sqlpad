const assert = require('assert');
const getColumns = require('../../lib/get-columns.js');

const d1 = new Date();
const d2 = new Date(new Date().getTime() + 60000);
const noTime = new Date('2019-01-01T00:00:00.000Z');

describe('lib/get-columns.js', function () {
  it('returns expected results', function () {
    const rows = [
      // To ensure nulls are handled appropriately start and end with them
      {
        alwaysNull: null,
        accountNumber: null,
        decimalString: null,
        number: null,
        string: null,
        datetime: null,
        numberString: null,
        date: noTime,
      },
      {
        alwaysNull: null,
        accountNumber: '099999',
        decimalString: '0.999',
        number: 30,
        string: 'abcdefg',
        datetime: d2,
        numberString: 100,
        date: null,
      },
      {
        alwaysNull: null,
        accountNumber: '0111',
        decimalString: '0.111',
        number: 0,
        string: '0',
        datetime: d1,
        numberString: 0,
        date: noTime,
      },
      {
        alwaysNull: null,
        accountNumber: null,
        decimalString: null,
        number: null,
        string: 'abc',
        datetime: null,
        numberString: null,
        date: noTime,
      },
    ];

    const columns = getColumns(rows);
    const cMap = {};
    columns.forEach((c) => {
      cMap[c.name] = c;
    });

    assert.equal(cMap.alwaysNull.datatype, null, 'null');

    assert.equal(cMap.accountNumber.datatype, 'string', 'accountNumber');
    assert.equal(
      cMap.accountNumber.maxValueLength,
      6,
      'accountNumber.maxValueLength'
    );

    assert.equal(cMap.decimalString.datatype, 'number', 'decimalString');
    assert.equal(cMap.decimalString.max, 0.999, 'decimalString.max');
    assert.equal(cMap.decimalString.min, 0.111, 'decimalString.min');

    assert.equal(cMap.number.datatype, 'number', 'number.datatype');
    assert.equal(cMap.number.max, 30, 'number.max');
    assert.equal(cMap.number.min, 0, 'number.min');

    assert.equal(cMap.string.datatype, 'string', 'string.datatype');
    assert.equal(cMap.string.maxValueLength, 7, 'string.maxValueLength');

    assert.equal(cMap.datetime.datatype, 'datetime', 'datetime.datatype');
    assert.equal(cMap.datetime.max.getTime(), d2.getTime(), 'datetime.max');
    assert.equal(cMap.datetime.min.getTime(), d1.getTime(), 'datetime.min');

    assert.equal(cMap.numberString.datatype, 'number', 'numberString.datatype');
    assert.equal(cMap.numberString.max, 100, 'numberString.max');
    assert.equal(cMap.numberString.min, 0, 'numberString.min');

    assert.equal(cMap.date.datatype, 'date', 'date.datatype');
  });
});
