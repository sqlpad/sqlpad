require('../typedefs');
const papa = require('papaparse');
const xlsx = require('node-xlsx');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');
const moment = require('moment');
const sanitize = require('sanitize-filename');

const FORMATS = ['csv', 'json', 'xlsx'];

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

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    const csvData = papa.unparse([columnNames].concat(rows));
    return res.send(csvData);
  }

  if (format === 'xlsx') {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const xlsxBuffer = xlsx.build([
      { name: 'query-results', data: [columnNames].concat(rows) },
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
