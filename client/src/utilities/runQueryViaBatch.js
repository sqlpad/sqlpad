import fetchJson from './fetch-json';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run query and returns results via batch API.
 * This is implemented to mimick the flow of the old `/query-results/` API,
 * where results were returned from that API call.
 * This function polls until the query is finished, and returns with the results.
 *
 * The returned data format is an array of objects,
 * instead of the array-of-array returned by the API.
 *
 * @param {Object} opt
 * @param {String} opt.batchText
 * @param {String} opt.connectionId
 * @param {String} [opt.selectedText]
 * @param {String} [opt.connectionClientId]
 * @param {String} [opt.queryId]
 * @param {String} [opt.name]
 * @param {Object} [opt.chart]
 */
export default async function runQueryViaBatch(opt) {
  if (!opt.batchText || !opt.connectionId) {
    throw new Error('batchText and connectionName required');
  }

  if (!opt.selectedText) {
    opt.selectedText = opt.batchText;
  }

  let batch;
  let error;

  let res = await fetchJson('POST', '/api/batches', opt);
  error = res.error;
  batch = res.data;

  while (!(batch.status === 'finished' || batch.status === 'error') && !error) {
    await sleep(500);
    res = await fetchJson('GET', `/api/batches/${batch.id}`);
    error = res.error;
    batch = res.data;
  }

  if (error) {
    return { error };
  }

  if (!batch.statements.length) {
    throw new Error('No statements?');
  }

  // For short-term API compat
  // Find out if a statement errored.
  // If it did, return that
  const statementWithError = batch.statements.find((s) => s.error);
  if (statementWithError) {
    return { error: statementWithError.error.title };
  }

  const statement = batch.statements[batch.statements.length - 1];

  res = await fetchJson('GET', `/api/statements/${statement.id}/results`);
  if (res.error) {
    error = res.error;
  }

  if (error) {
    return { error };
  }

  const { columns } = statement;

  const rows = res.data.map((row) => {
    const obj = {};
    columns.forEach((c, index) => {
      obj[c.name] = row[index];
    });
    return obj;
  });

  const links = {
    csv: `/statement-results/${statement.id}.csv`,
    json: `/statement-results/${statement.id}.json`,
    xlsx: `/statement-results/${statement.id}.xlsx`,
  };

  if (opt.queryId) {
    links.table = `/query-table/${opt.queryId}`;
    links.chart = `/query-chart/${opt.queryId}`;
    if (opt.connectionClientId) {
      const params = `?connectionClientId=${opt.connectionClientId}`;
      links.table += params;
      links.chart += params;
    }
  }

  return {
    data: {
      batchId: batch.id,
      statementId: statement.id,
      columns,
      rows,
      incomplete: statement.incomplete,
      links,
      startTime: statement.startTime,
      stopTime: statement.stopTime,
      durationMs: statement.durationMs,
    },
    error,
  };
}
