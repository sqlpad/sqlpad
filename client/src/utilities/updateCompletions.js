// import various ace editor things
import * as ace from 'brace';
import 'brace/mode/sql';
import 'brace/theme/sqlserver';
import 'brace/ext/searchbox';
import 'brace/ext/language_tools';

export default updateCompletions;

// There's stuff below that logs to console a lot
// documentation on this autocompletion is light
// and you may find it helpful to print some vars out during dev
const DEBUG_ON = false;

function debug() {
  if (DEBUG_ON) console.log.apply(null, arguments);
}

/**
 * Updates global completions for all ace editors in use.
 * First pass and kind of hacked together.
 *
 * @todo make more reacty
 * @todo make less naive/more intelligent (use a sql parser?)
 * @todo scoped to an editor instance instead of all instances
 * @param {schemaInfoObject} schemaInfo
 */
function updateCompletions(schemaInfo) {
  debug('updating completions');
  debug(schemaInfo);

  if (schemaInfo === null || schemaInfo === undefined) {
    return;
  }

  // TODO make this more efficient and less confusing
  // It'll likely take some restructuring the way schema data is stored.
  // for example, if <table> is referenced, later on relevant dot matchs should also include the schema of <table>
  // right now that's hacked in. a formal sqlparser might help here

  // In ace, a . resets the prefix var passed to completer
  // we'll need autocomplete on each thing by itself when user uses .
  // look up previous chain to figure out what hierarchy we're dealing with
  // and change autocomplete deal with that
  // for now we pre-assemble entire buckets of all schemas/tables/columns
  // these handle autocompletes with no dot
  // NOTE sqlpad is also firing autocomplete on every keypress instead of using live autocomplete
  const schemaCompletions = [];
  const tableCompletions = [];

  // we also should create an index of dotted autocompletes.
  // given a precedingtoken as "sometable." or "someschema.table." we should be able to look up relevant completions
  // combos to support are...
  // SCHEMA
  // TABLE
  // SCHEMA.TABLE
  const matchMaps = {
    schema: {}, // will contain tables
    table: {},
    schemaTable: {},
  };

  Object.keys(schemaInfo).forEach((schema) => {
    schemaCompletions.push({
      name: schema,
      value: schema,
      score: 0,
      meta: 'schema',
    });
    const SCHEMA = schema.toUpperCase();
    if (!matchMaps.schema[SCHEMA]) matchMaps.schema[SCHEMA] = [];

    Object.keys(schemaInfo[schema]).forEach((table) => {
      const SCHEMA_TABLE = SCHEMA + '.' + table.toUpperCase();
      const TABLE = table.toUpperCase();
      if (!matchMaps.table[TABLE]) matchMaps.table[TABLE] = [];
      if (!matchMaps.schemaTable[SCHEMA_TABLE]) {
        matchMaps.schemaTable[SCHEMA_TABLE] = [];
      }
      const tableCompletion = {
        name: table,
        value: table,
        score: 0,
        meta: 'table',
        schema,
      };
      tableCompletions.push(tableCompletion);
      matchMaps.schema[SCHEMA].push(tableCompletion);

      const columns = schemaInfo[schema][table];
      columns.forEach((column) => {
        const columnCompletion = {
          name: schema + table + column.column_name,
          value: column.column_name,
          score: 0,
          meta: 'column',
          schema,
          table,
        };
        matchMaps.table[TABLE].push(columnCompletion);
        matchMaps.schemaTable[SCHEMA_TABLE].push(columnCompletion);
      });
    });
  });

  const tableWantedCompletions = schemaCompletions.concat(tableCompletions);

  const myCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
      // figure out if there are any schemas/tables referenced in query
      const allTokens = session
        .getValue()
        .split(/\s+/)
        .map((t) => t.toUpperCase());
      const relevantDottedMatches = {};
      Object.keys(matchMaps.schemaTable).forEach((schemaTable) => {
        if (allTokens.indexOf(schemaTable) >= 0) {
          relevantDottedMatches[schemaTable] =
            matchMaps.schemaTable[schemaTable];
          // HACK - also add relevant matches for table only
          const firstMatch = matchMaps.schemaTable[schemaTable][0];
          const table = firstMatch.table.toUpperCase();
          relevantDottedMatches[table] = matchMaps.table[table];
        }
      });
      Object.keys(matchMaps.table).forEach((table) => {
        if (allTokens.indexOf(table) >= 0) {
          relevantDottedMatches[table] = matchMaps.table[table];
          // HACK add schemaTable match for this table
          // we store schema at column match item, so look at first one and use that
          const firstMatch = matchMaps.table[table][0];
          const schemaTable =
            firstMatch.schema.toUpperCase() +
            '.' +
            firstMatch.table.toUpperCase();
          relevantDottedMatches[schemaTable] = matchMaps.table[table];
        }
      });
      debug('matched found: ', Object.keys(relevantDottedMatches));

      // complete for schema and tables already referenced, plus their columns
      let matches = [];
      Object.keys(relevantDottedMatches).forEach((key) => {
        matches = matches.concat(relevantDottedMatches[key]);
      });
      const schemas = {};
      const tables = {};
      const wantedColumnCompletions = [];
      matches.forEach((match) => {
        if (match.schema) schemas[match.schema] = match.schema;
        if (match.table) tables[match.table] = match.schema;
      });
      Object.keys(schemas).forEach((schema) => {
        wantedColumnCompletions.push({
          name: schema,
          value: schema,
          score: 0,
          meta: 'schema',
        });
      });
      Object.keys(tables).forEach((table) => {
        const tableCompletion = {
          name: table,
          value: table,
          score: 0,
          meta: 'table',
        };
        wantedColumnCompletions.push(tableCompletion);
        const SCHEMA = tables[table].toUpperCase();
        if (!relevantDottedMatches[SCHEMA]) relevantDottedMatches[SCHEMA] = [];
        relevantDottedMatches[SCHEMA].push(tableCompletion);
      });

      // get tokens leading up to the cursor to figure out context
      // depending on where we are we either want tables or we want columns
      const tableWantedKeywords = ['FROM', 'JOIN'];
      const columnWantedKeywords = ['SELECT', 'WHERE', 'GROUP', 'HAVING', 'ON'];

      // find out what is wanted
      // first look at the current line before cursor, then rest of lines beforehand
      let wanted = '';
      const currentRow = pos.row;
      for (let r = currentRow; r >= 0; r--) {
        let line = session.getDocument().getLine(r);
        let lineTokens;
        // if dealing with current row only use stuff before cursor
        if (r === currentRow) {
          line = line.slice(0, pos.column);
        }
        lineTokens = line.split(/\s+/).map((t) => t.toUpperCase());

        for (let i = lineTokens.length - 1; i >= 0; i--) {
          const token = lineTokens[i];
          if (columnWantedKeywords.indexOf(token) >= 0) {
            debug('WANT COLUMN BECAUSE FOUND: ', token);
            wanted = 'COLUMN';
            r = 0;
            break;
          }
          if (tableWantedKeywords.indexOf(token) >= 0) {
            debug('WANT TABLE BECAUSE FOUND: ', token);
            wanted = 'TABLE';
            r = 0;
            break;
          }
        }
      }
      debug('WANTED: ', wanted);

      const currentLine = session.getDocument().getLine(pos.row);
      const currentTokens = currentLine
        .slice(0, pos.column)
        .split(/\s+/)
        .map((t) => t.toUpperCase());
      const precedingCharacter = currentLine.slice(pos.column - 1, pos.column);
      const precedingToken = currentTokens[currentTokens.length - 1];

      // if preceding token has a . try to provide completions based on that object
      debug('PREFIX: "%s"', prefix);
      debug('PRECEDING CHAR: "%s"', precedingCharacter);
      debug('PRECEDING TOKEN: "%s"', precedingToken);
      if (precedingToken.indexOf('.') >= 0) {
        let dotTokens = precedingToken.split('.');
        dotTokens.pop();
        const DOT_MATCH = dotTokens.join('.').toUpperCase();
        debug(
          'Completing for "%s" even though we got "%s"',
          DOT_MATCH,
          precedingToken
        );
        if (wanted === 'TABLE') {
          // if we're in a table place, a completion should only be for tables, not columns
          return callback(null, matchMaps.schema[DOT_MATCH]);
        }
        if (wanted === 'COLUMN') {
          // here we should see show matches for only the tables mentioned in query
          return callback(null, relevantDottedMatches[DOT_MATCH]);
        }
      }

      // if we are not dealing with a . match show all relevant objects
      if (wanted === 'TABLE') {
        return callback(null, tableWantedCompletions);
      }
      if (wanted === 'COLUMN') {
        // TODO also include alias?
        return callback(null, matches.concat(wantedColumnCompletions));
      }
      // No keywords found? User probably wants some keywords
      callback(null, null);
    },
  };

  ace.acequire(['ace/ext/language_tools'], (langTools) => {
    langTools.setCompleters([myCompleter]);
    // Note - later on might be able to set a completer for specific editor like:
    // editor.completers = [staticWordCompleter]
  });
}
