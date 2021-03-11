require('../typedefs');
const papa = require('papaparse');
const xlsx = require('node-xlsx');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');
const moment = require('moment');
const sanitize = require('sanitize-filename');

const FORMATS = ['csv', 'json', 'xlsx'];

const renderValue = (input, column) => {
  if (input === null || input === undefined) {
    return null;
  } else if (input === true || input === false) {
    return input;
  } else if (column.datatype === 'datetime' && typeof input === 'string') {
    // Remove the letters from ISO string and present as is
    return input.replace('T', ' ').replace('Z', '');
  } else if (column.datatype === 'date' && typeof input === 'string') {
    // Formats ISO string to YYYY-MM-DD
    return input.substring(0, 10);
  } else if (typeof input === 'object') {
    return JSON.stringify(input, null, 2);
  } else {
    return input;
  }
};

/**
 * NOTE: This is not an `/api/` route, so the responses here are not JSON
 *
 * @param {Req} req
 * @param {Res} res
 */
async function handleDownload(req, res) {
  const { models, user, config, params } = req;
  const { statementId, format } = params;

  if (!FORMATS.includes(format)) {
    res.status(400).send(`Format must be one of ${FORMATS.join(', ')}`);
  }

  // Despite config setting being for csv, it is used for all formats
  if (!config.get('allowCsvDownload')) {
    return res.sendStatus(403);
  }

  const statement = await models.statements.findOneById(statementId);
  if (!statement) {
    return res.sendStatus(404);
  }

  // Get batch to ensure user has access to this data
  const batch = await models.batches.findOneById(statement.batchId);

  if (!batch) {
    return res.sendStatus(404);
  }

  if (batch.userId !== user.id) {
    return res.sendStatus(403);
  }

  const rows = await models.statements.getStatementResults(statementId);
  const columnNames = statement.columns.map((col) => col.name);

  const name = batch.name || 'SQLPad Query Results';
  const simpleDate = moment().format('YYYY-MM-DD');
  const filename = encodeURIComponent(
    sanitize(`${name} ${simpleDate}.${format}`)
  );
  res.setHeader(
    'Content-disposition',
    'attachment; filename="' + filename + '"'
  );

  // Convert row data to formats for exports
  // Currently this JSON stringifies objects and arrays,
  // and strips the T and Z from JSON stringified date strings
  // TODO - for xlsx export, we should see if possible to get values formatted correctly in file
  // For example, sending a date object doesn't make it a date cell
  // Unsure if node-xlsx (https://www.npmjs.com/package/node-xlsx) supports this.
  // May need to use xlsx package directly (https://www.npmjs.com/package/xlsx)
  const rowsForExport = rows.map((row) => {
    const convertedRow = statement.columns.map((col, index) =>
      renderValue(row[index], col)
    );
    return convertedRow;
  });

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    const csvData = papa.unparse([columnNames].concat(rowsForExport));
    return res.send(csvData);
  }

  if (format === 'xlsx') {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const xlsxBuffer = xlsx.build([
      { name: 'query-results', data: [columnNames].concat(rowsForExport) },
    ]);
    return res.send(xlsxBuffer);
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    const arrOfObj = rows.map((row) => {
      const obj = {};
      columnNames.forEach((name, index) => {
        obj[name] = row[index];
      });
      return obj;
    });
    return res.send(JSON.stringify(arrOfObj));
  }

  // Shouldn't happen
  return res.sendStatus(400);
}

router.get(
  '/statement-results/:statementId.:format',
  mustBeAuthenticated,
  wrap(handleDownload)
);

module.exports = router;
