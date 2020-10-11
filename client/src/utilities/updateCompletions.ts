import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import { ConnectionSchema } from '../types';

export default updateCompletions;

// There's stuff below that logs to console a lot
// documentation on this autocompletion is light
// and you may find it helpful to print some vars out during dev
const DEBUG_ON = false;

function debug(...args: any) {
  if (DEBUG_ON) console.log.apply(null, args);
}

type Completion = {
  name: string;
  value: string;
  score: number;
  meta: string;
  schema?: string;
  table?: string;
};

type MatchMap = {
  schema: {
    [schemaName: string]: Completion[];
  };
  table: {
    [tableName: string]: Completion[];
  };
  schemaTable: {
    [schemaDotTableName: string]: Completion[];
  };
};

type DottedMatchMap = {
  [key: string]: Array<Completion>;
};

/**
 * Updates global completions for all ace editors in use.
 * First pass and kind of hacked together.
 *
 * @todo make more reacty
 * @todo make less naive/more intelligent (use a sql parser?)
 * @todo scoped to an editor instance instead of all instances
 * @param {schemaInfoObject} connectionSchema
 */
function updateCompletions(connectionSchema: ConnectionSchema) {
  debug('updating completions');
  debug(connectionSchema);

  if (connectionSchema === null || connectionSchema === undefined) {
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
  const schemaCompletions: Completion[] = [];
  const tableCompletions: Completion[] = [];

  // we also should create an index of dotted autocompletes.
  // given a precedingtoken as "sometable." or "someschema.table." we should be able to look up relevant completions
  // combos to support are...
  // SCHEMA
  // TABLE
  // SCHEMA.TABLE
  const matchMaps: MatchMap = {
    schema: {}, // will contain tables
    table: {},
    schemaTable: {},
  };

  connectionSchema?.schemas?.forEach((schema) => {
    schemaCompletions.push({
      name: schema.name,
      value: schema.name,
      score: 0,
      meta: 'schema',
    });
    const SCHEMA = schema.name.toUpperCase();

    if (!matchMaps.schema[SCHEMA]) matchMaps.schema[SCHEMA] = [];

    schema.tables.forEach((table) => {
      const SCHEMA_TABLE = SCHEMA + '.' + table.name.toUpperCase();
      const TABLE = table.name.toUpperCase();

      if (!matchMaps.table[TABLE]) matchMaps.table[TABLE] = [];

      if (!matchMaps.schemaTable[SCHEMA_TABLE]) {
        matchMaps.schemaTable[SCHEMA_TABLE] = [];
      }
      const tableCompletion = {
        name: table.name,
        value: table.name,
        score: 0,
        meta: 'table',
        schema: schema.name,
      };
      tableCompletions.push(tableCompletion);
      matchMaps.schema[SCHEMA].push(tableCompletion);

      table.columns.forEach((column) => {
        const columnCompletion = {
          name: schema.name + table.name + column.name,
          value: column.name,
          score: 0,
          meta: 'column',
          schema: schema.name,
          table: table.name,
        };
        matchMaps.table[TABLE].push(columnCompletion);
        matchMaps.schemaTable[SCHEMA_TABLE].push(columnCompletion);
      });
    });
  });

  const tableWantedCompletions = schemaCompletions.concat(tableCompletions);

  const myCompleter = {
    getCompletions: function (
      editor: any,
      session: any,
      pos: any,
      prefix: any,
      callback: any
    ) {
      // figure out if there are any schemas/tables referenced in query
      const allTokens: string[] = session
        .getValue()
        .split(/\s+/)
        .map((t: string) => t.toUpperCase());
      const relevantDottedMatches: DottedMatchMap = {};

      // Find any references of SCHEMANAME.TABLENAME in tokens
      // If a match is found, the match values are added to relevant dotted match for that SCHEMANAME.TABLENAME value
      // Relevant matches are also added for table
      // This solution is a bit hacky in that it dips down into the first column value to grab table name
      Object.keys(matchMaps.schemaTable).forEach((schemaTable) => {
        if (allTokens.indexOf(schemaTable) >= 0) {
          relevantDottedMatches[schemaTable] =
            matchMaps.schemaTable[schemaTable];
          // Also add relevant matches for table only by grabbing table from first column
          const firstMatch = matchMaps.schemaTable[schemaTable][0];
          if (firstMatch.table) {
            const table = firstMatch.table.toUpperCase();
            relevantDottedMatches[table] = matchMaps.table[table];
          }
        }
      });

      // Find any references of TABLENAME in tokens
      // If a match is found, add it to relevant matches
      // Also add matches for SCHEMANAME.TABLENAME
      // To do so requires looking to first column value to grab schema and table from there
      Object.keys(matchMaps.table).forEach((table) => {
        if (allTokens.indexOf(table) >= 0) {
          relevantDottedMatches[table] = matchMaps.table[table];
          // HACK add schemaTable match for this table
          // we store schema at column match item, so look at first one and use that
          const firstMatch = matchMaps.table[table][0];
          if (firstMatch.schema && firstMatch.table) {
            const schemaTable =
              firstMatch.schema.toUpperCase() +
              '.' +
              firstMatch.table.toUpperCase();
            relevantDottedMatches[schemaTable] = matchMaps.table[table];
          }
        }
      });
      debug('matched found: ', Object.keys(relevantDottedMatches));

      // Complete for schema and tables already referenced, plus their columns

      // Flatten map of completion arrays into 1 array
      let matches: Array<Completion> = [];
      Object.values(relevantDottedMatches).forEach((completions) => {
        matches = matches.concat(completions);
      });

      // Index schemas and tables so that 1 completion is added for each
      const schemas: { [key: string]: string } = {};
      const tables: { [key: string]: string } = {};

      matches.forEach((match) => {
        if (match.schema) {
          schemas[match.schema] = match.schema;
        }
        if (match.table && match.schema) {
          tables[match.table] = match.schema;
        }
      });

      // Iterate over the indexed tables and schemas and add column completions
      // When wanting a column value, schema and tables are also appropriate for autocomplete
      const wantedColumnCompletions: Array<Completion> = [];
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
        if (!relevantDottedMatches[SCHEMA]) {
          relevantDottedMatches[SCHEMA] = [];
        }
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
        lineTokens = line.split(/\s+/).map((t: any) => t.toUpperCase());

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
        .map((t: any) => t.toUpperCase());
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

  ace.acequire(['ace/ext/language_tools'], (langTools: any) => {
    langTools.setCompleters([myCompleter]);
    // Note - later on might be able to set a completer for specific editor like:
    // editor.completers = [staticWordCompleter]
  });
}
