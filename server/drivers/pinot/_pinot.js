const fetch = require('node-fetch');

function getHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  // We might not always get JSON back, so we need to take text and handle accordingly
  const text = await response.text();

  let res;
  try {
    res = JSON.parse(text);
  } catch (error) {
    // If JSON didn't parse, we likely received a text response back of an error message
    // It might look something like this:
    // ProcessingException(errorCode:150, message:PQLParsingError:
    // org.apache.pinot.sql.parsers.SqlCompilationException: 'baseballStats.playerID' should appear in GROUP BY clause.
    // at org.apache.pinot.sql.parsers.CalciteSqlParser.validateGroupByClause(CalciteSqlParser.java:177)
    // at org.apache.pinot.sql.parsers.CalciteSqlParser.validate(CalciteSqlParser.java:114)
    // at org.apache.pinot.sql.parsers.CalciteSqlParser.queryRewrite(CalciteSqlParser.java:364)
    // at org.apache.pinot.sql.parsers.CalciteSqlParser.compileCalciteSqlToPinotQuery(CalciteSqlParser.java:338)
    // at org.apache.pinot.sql.parsers.CalciteSqlParser.compileToPinotQuery(CalciteSqlParser.java:104)
    // at org.apache.pinot.sql.parsers.CalciteSqlCompiler.compileToBrokerRequest(CalciteSqlCompiler.java:33)
    // at org.apache.pinot.controller.api.resources.PinotQueryResource.getQueryResponse(PinotQueryResource.java:158)
    // at org.apache.pinot.controller.api.resources.PinotQueryResource.handlePostSql(PinotQueryResource.java:131)
    // at sun.reflect.GeneratedMethodAccessor51.invoke(Unknown Source)
    // at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    // at java.lang.reflect.Method.invoke(Method.java:498)
    // at org.glassfish.jersey.server.model.internal.ResourceMethodInvocationHandlerFactory.lambda$static$0(ResourceMethodInvocationHandlerFactory.java:52)
    // at org.glassfish.jersey.server.model.internal.AbstractJavaResourceMethodDispatcher$1.run(AbstractJavaResourceMethodDispatcher.java:124)
    // at org.glassfish.jersey.server.model.internal.AbstractJavaResourceMethodDispatcher.invoke(AbstractJavaResourceMethodDispatcher.java:167))

    // Unsure why this happens at this point.
    // For now, strip out all lines that start with `at `, then throw new error with shortened message
    const cleanedText = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !line.startsWith('at '))
      .join('\n ');

    throw new Error(cleanedText);
  }
  return res;
}

async function getJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  return response.json();
}

// Given config and query, returns promise with the results
// Good queries come back as:
// {
//   "resultTable": {
//     "dataSchema": {
//       "columnDataTypes": [
//         "INT",
//         "INT",
//         "STRING",
//       ],
//       "columnNames": [
//         "AtBatting",
//         "G_old",
//         "league",
//       ]
//     },
//     "rows": [
//       [
//         0,
//         11,
//         "NL",
//       ],
//       [
//         2,
//         45,
//         "NL",
//       ]
//     ]
//   },
//   "exceptions": [],
//   "numServersQueried": 1,
//   "numServersResponded": 1,
//   "numSegmentsQueried": 1,
//   "numSegmentsProcessed": 1,
//   "numSegmentsMatched": 1,
//   "numConsumingSegmentsQueried": 0,
//   "numDocsScanned": 2,
//   "numEntriesScannedInFilter": 0,
//   "numEntriesScannedPostFilter": 50,
//   "numGroupsLimitReached": false,
//   "totalDocs": 97889,
//   "timeUsedMs": 6,
//   "segmentStatistics": [],
//   "traceInfo": {},
//   "minConsumingFreshnessTimeMs": 0
// }
//
// Bad queries come back as:
// {
//   "exceptions": [
//     {
//       "errorCode": 410,
//       "message": "BrokerResourceMissingError"
//     }
//   ],
//   "numServersQueried": 0,
//   "numServersResponded": 0,
//   "numSegmentsQueried": 0,
//   "numSegmentsProcessed": 0,
//   "numSegmentsMatched": 0,
//   "numConsumingSegmentsQueried": 0,
//   "numDocsScanned": 0,
//   "numEntriesScannedInFilter": 0,
//   "numEntriesScannedPostFilter": 0,
//   "numGroupsLimitReached": false,
//   "totalDocs": 0,
//   "timeUsedMs": 0,
//   "segmentStatistics": [],
//   "traceInfo": {},
//   "minConsumingFreshnessTimeMs": 0
// }
async function postSql(controllerUrl, sql) {
  // If using broker (typically port :8099) the path is `/query/sql`
  // If using controller (typically port :9000) the path is `/sql`
  return postJson(`${controllerUrl}/sql`, {
    sql,
    trace: false,
  });
}

/**
 * Get array of tables
 * Returns { tables: ['table1', 'table2'] }
 * @param {string} controllerUrl
 */
async function getTables(controllerUrl) {
  return getJson(`${controllerUrl}/tables`);
}

/**
 * Get schema for supplied table
 * 
 * Returns 
 * {
      schemaName: 'baseballStats',
      dimensionFieldSpecs: [
        { name: 'playerID', dataType: 'STRING' },
        { name: 'yearID', dataType: 'INT' }
      ],
      metricFieldSpecs: [
        { name: 'playerStint', dataType: 'INT' },
        { name: 'numberOfGames', dataType: 'INT' }
      ]
    }
 * 
 * @param {string} controllerUrl
 * @param {string} tableName
 */
async function getTableSchema(controllerUrl, tableName) {
  return getJson(`${controllerUrl}/tables/${tableName}/schema`);
}

/**
 * Get version of pinot components.
 * Not really necessary for SQLPad but will be used as a connection config setting validation
 * since Pinot can't run arbitrary queries like `SELECT 1`.
 * @param {string} controllerUrl
 */
async function getVersion(controllerUrl) {
  return getJson(`${controllerUrl}/version`);
}

module.exports = { postSql, getTables, getTableSchema, getVersion };
