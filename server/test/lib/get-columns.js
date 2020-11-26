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
        bool: false,
        obj: {},
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
        bool: true,
        obj: { a: 'foo', b: 'bar' },
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
        bool: true,
        obj: null,
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
        bool: true,
        obj: { a: 'foo', b: 'bar' },
      },
    ];

    const columns = getColumns(rows);
    const cMap = {};
    columns.forEach((c) => {
      cMap[c.name] = c;
    });

    assert.deepStrictEqual(cMap.alwaysNull, {
      name: 'alwaysNull',
      datatype: null,
      max: null,
      min: null,
      maxLineLength: 0,
      maxValueLength: 0,
    });

    assert.deepStrictEqual(cMap.accountNumber, {
      name: 'accountNumber',
      datatype: 'string',
      max: null,
      min: null,
      maxLineLength: 6,
      maxValueLength: 6,
    });

    assert.deepStrictEqual(cMap.decimalString, {
      name: 'decimalString',
      datatype: 'number',
      max: 0.999,
      min: 0.111,
      maxLineLength: 0,
      maxValueLength: 0,
    });

    assert.deepStrictEqual(cMap.number, {
      name: 'number',
      datatype: 'number',
      max: 30,
      min: 0,
      maxLineLength: 0,
      maxValueLength: 0,
    });

    assert.deepStrictEqual(cMap.string, {
      name: 'string',
      datatype: 'string',
      max: null,
      min: null,
      maxLineLength: 7,
      maxValueLength: 7,
    });

    assert.deepStrictEqual(cMap.datetime, {
      name: 'datetime',
      datatype: 'datetime',
      max: d2,
      min: d1,
      maxLineLength: 23,
      maxValueLength: 23,
    });

    assert.deepStrictEqual(cMap.numberString, {
      name: 'numberString',
      datatype: 'number',
      max: 100,
      min: 0,
      maxLineLength: 0,
      maxValueLength: 0,
    });

    assert.deepStrictEqual(cMap.date, {
      name: 'date',
      datatype: 'date',
      max: noTime,
      min: noTime,
      maxLineLength: 10,
      maxValueLength: 10,
    });

    assert.deepStrictEqual(cMap.bool, {
      name: 'bool',
      datatype: 'boolean',
      max: null,
      min: null,
      maxLineLength: 4,
      maxValueLength: 4,
    });

    assert.deepStrictEqual(cMap.obj, {
      name: 'obj',
      datatype: 'object',
      max: null,
      min: null,
      maxLineLength: 13,
      maxValueLength: 30,
    });
  });
});
