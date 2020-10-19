const assert = require('assert');
const utils = require('../../drivers/utils');

describe('drivers/utils', function () {
  it('formatSchemaQueryResults handles full row set', function () {
    const rows = [
      {
        schema_name: 's1',
        schema_description: 's1d',
        table_name: 't1',
        table_description: 't1d',
        column_name: 'c1',
        column_description: 'c1d',
        data_type: 'dt1',
      },
      {
        schema_name: 's1',
        schema_description: 's1d',
        table_name: 't1',
        table_description: 't1d',
        column_name: 'c2',
        column_description: 'c2d',
        data_type: 'dt2',
      },
      {
        schema_name: 's2',
        schema_description: 's2d',
        table_name: 't1',
        table_description: 't1d',
        column_name: 'c1',
        column_description: 'c1d',
        data_type: 'dt1',
      },
    ];

    const res = utils.formatSchemaQueryResults({ rows });

    assert.deepStrictEqual(res, {
      schemas: [
        {
          name: 's1',
          description: 's1d',
          tables: [
            {
              name: 't1',
              description: 't1d',
              columns: [
                {
                  name: 'c1',
                  description: 'c1d',
                  dataType: 'dt1',
                },
                {
                  name: 'c2',
                  description: 'c2d',
                  dataType: 'dt2',
                },
              ],
            },
          ],
        },
        {
          name: 's2',
          description: 's2d',
          tables: [
            {
              name: 't1',
              description: 't1d',
              columns: [
                {
                  name: 'c1',
                  description: 'c1d',
                  dataType: 'dt1',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('formatSchemaQueryResults handles original row and mixed case', function () {
    const rows = [
      {
        table_schema: 's1',
        SCHEMA_DESCRIPTION: 's1d',
        table_name: 't1',
        table_description: 't1d',
        column_name: 'c1',
        column_description: 'c1d',
        data_type: 'dt1',
      },
    ];

    const res = utils.formatSchemaQueryResults({ rows });

    assert.deepStrictEqual(res, {
      schemas: [
        {
          name: 's1',
          description: 's1d',
          tables: [
            {
              name: 't1',
              description: 't1d',
              columns: [
                {
                  name: 'c1',
                  description: 'c1d',
                  dataType: 'dt1',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('formatSchemaQueryResults handles only required fields', function () {
    const rows = [
      {
        table_name: 't1',
        column_name: 'c1',
        data_type: 'dt1',
      },
    ];

    const res = utils.formatSchemaQueryResults({ rows });

    assert.deepStrictEqual(res, {
      tables: [
        {
          name: 't1',
          description: undefined,
          columns: [
            {
              name: 'c1',
              description: undefined,
              dataType: 'dt1',
            },
          ],
        },
      ],
    });
  });
});
