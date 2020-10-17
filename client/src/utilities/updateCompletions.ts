import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import { ConnectionSchema, TableColumn } from '../types';

export default updateCompletions;

// There's stuff below that logs to console a lot
// documentation on this autocompletion is light
// and you may find it helpful to print some vars out during dev
const DEBUG_ON = true;

function debug(...args: any) {
  if (DEBUG_ON) console.log.apply(null, args);
}

// Notes about following implementation:
//
// In ace, a . resets the prefix var passed to completer
// SQLPad fires autocomplete on every keypress instead of using live autocomplete
//
// General autocomplete strategy
//
// For any kind of suggestion, we'll either want a table, or a column
//
// If table is wanted, autocomlete should suggest schemas and tables
// Preferred ranking would be
//   1) Schemas and tables alrleady in the editor
//   2) Any schema/table available
//
// If column is wanted, autocomplete should suggest schema, table, and columns
// Preferred ranking would be
//   1) Columns of tables already in the editor should be high scoring suggestions
//   2) Schemas/tables of tables already in the editor
//   3) schemas/tables that user can use to "navigate down" to a specific column (maybe user is only in SELECT and hasn't gotten to FROM yet)
//   4) Any column (might not want to show - could be noisy)
//
// In addition to wanting either a table or a column, suggestions will either be:
// 1) A dotted-suggestion (eg `schema.table.` or `tablename.` for columns)
// 2) An initial suggestion (user only has entered some keys, and preceding token has no dot)

/**
 * AceCompletion is the object format expected by Ace editor
 */
type AceCompletion = {
  name: string;
  value: string;
  score: number;
  meta: string;
};

/**
 * Table represents a central object for tryingn to figure out relevant completions when a column is ultimately wanted.
 * To suggest a column, we must first try and figure out which columns have been referenced in the query.
 * Once found tables are idenfied, completion maps are created to suggest completions based on the identifiers
 */
class Table {
  // full path of table, schema.table
  id: string;
  schema?: string;
  name: string;
  columns: TableColumn[];

  constructor(name: string, columns: TableColumn[], schema?: string) {
    this.id = schema ? `${schema}.${name}`.toLowerCase() : name.toLowerCase();
    this.name = name;
    this.columns = columns;
    this.schema = schema;
  }
}

class TableIndex {
  byIdentifier: Record<string, Table[]>;

  constructor() {
    this.byIdentifier = {};
  }

  getTablesForIdentifier(idOrName: string) {
    return this.byIdentifier[idOrName.toLowerCase()] || [];
  }

  addTable(table: Table) {
    const lowerName = table.name.toLowerCase();
    if (!this.byIdentifier[table.id]) {
      this.byIdentifier[table.id] = [];
    }
    if (!this.byIdentifier[lowerName]) {
      this.byIdentifier[lowerName] = [];
    }

    let exists = this.byIdentifier[table.id].find((t) => t.id === table.id);
    if (!exists) {
      this.byIdentifier[table.id].push(table);
    }

    exists = this.byIdentifier[lowerName].find((t) => t.id === table.id);
    if (!exists) {
      this.byIdentifier[lowerName].push(table);
    }
  }
}

/**
 * Updates global completions for all ace editors in use.
 * First pass and kind of hacked together.
 *
 * @todo make more reacty
 * @todo make less naive/more intelligent (use a sql parser?)
 * @todo scoped to an editor instance instead of all instances
 * @param  connectionSchema
 */
function updateCompletions(connectionSchema: ConnectionSchema) {
  debug('updating completions');
  debug(connectionSchema);

  if (connectionSchema === null || connectionSchema === undefined) {
    return;
  }

  const tableIndex = new TableIndex();
  const initialTableWantedSuggestions: AceCompletion[] = [];
  const tablesBySchema: Record<string, AceCompletion[]> = {};

  if (connectionSchema.schemas) {
    connectionSchema.schemas.forEach((schema) => {
      initialTableWantedSuggestions.push({
        value: schema.name,
        name: schema.name,
        score: 0,
        meta: 'schema',
      });

      schema.tables.forEach((table) => {
        const t = new Table(table.name, table.columns, schema.name);
        tableIndex.addTable(t);

        initialTableWantedSuggestions.push({
          value: table.name,
          name: table.name,
          score: 0,
          meta: 'table',
        });
        if (!tablesBySchema[schema.name.toLowerCase()]) {
          tablesBySchema[schema.name.toLowerCase()] = [];
        }
        tablesBySchema[schema.name.toLowerCase()].push({
          value: table.name,
          name: table.name,
          score: 0,
          meta: 'table',
        });
      });
    });
  } else if (connectionSchema.tables) {
    connectionSchema.tables.forEach((table) => {
      const t = new Table(table.name, table.columns);
      tableIndex.addTable(t);

      table.columns.forEach((column) => {
        initialTableWantedSuggestions.push({
          value: table.name,
          name: table.name,
          score: 0,
          meta: 'table',
        });
      });
    });
  }

  const myCompleter = {
    getCompletions: function (
      editor: any,
      session: any,
      pos: any,
      prefix: any,
      callback: any
    ) {
      debug('getCompletions() -----------');

      // get tokens leading up to the cursor to figure out context
      // depending on where we are we either want tables or we want columns
      const tableWantedKeywords = ['from', 'join'];
      const columnWantedKeywords = ['select', 'where', 'group', 'having', 'on'];

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
        lineTokens = line.split(/\s+/).map((t: any) => t.toLowerCase());

        for (let i = lineTokens.length - 1; i >= 0; i--) {
          const token = lineTokens[i];
          if (columnWantedKeywords.indexOf(token) >= 0) {
            debug('Want column because found: ', token);
            wanted = 'COLUMN';
            r = 0;
            break;
          }
          if (tableWantedKeywords.indexOf(token) >= 0) {
            debug('Want table because found: ', token);
            wanted = 'TABLE';
            r = 0;
            break;
          }
        }
      }
      debug('Wanted: ', wanted);

      const currentLine = session.getDocument().getLine(pos.row);
      const currentTokens: string[] = currentLine
        .slice(0, pos.column)
        .split(/\s+/)
        .map((t: string) => t.toLowerCase());
      const precedingToken = currentTokens[currentTokens.length - 1];

      // If precedingToken contains a dot, derive the dottedIdentifier to use to look up matches
      // precedingToken will have trailing dot ie `schema.table.`
      // dottedIdenfier is converted to `schema.table`
      let dottedIdentifier;
      if (precedingToken.indexOf('.') >= 0) {
        dottedIdentifier = precedingToken.substring(
          0,
          precedingToken.length - 1
        );
      }

      // If could not derive what is wanted do not send suggestions
      if (wanted === '') {
        return callback(null, null);
      }

      // The suggestions below require knowing what tables are referenced in the query
      // Try and derive based on basic matching
      // figure out if there are any schemas/tables referenced in query
      const allTokens: string[] = session
        .getValue()
        .split(/\s+/)
        .map((t: string) => t.toLowerCase());

      // First find any references of schemas or tables in tokens
      // Anything matched will be added to relevant completions
      let foundTables: Table[] = [];

      allTokens.forEach((token) => {
        const tables = tableIndex.getTablesForIdentifier(token);
        foundTables = foundTables.concat(tables);
      });

      // Iterate over the indexed tables and schemas and add column completions
      // When wanting a column value, schema and tables are also appropriate for autocomplete
      const schemasById: Record<string, AceCompletion> = {};
      const tablesById: Record<string, AceCompletion> = {};
      const columnsById: Record<string, AceCompletion> = {};

      const columnWantedDotMatches: Record<string, AceCompletion[]> = {};

      foundTables.forEach((table) => {
        if (table.schema) {
          const ac = {
            name: table.schema,
            value: table.schema,
            meta: 'schema',
            score: 0,
          };
          schemasById[table.schema] = ac;
        }

        const tableCompletion = {
          name: table.name,
          value: table.name,
          meta: 'table',
          score: 0,
        };
        tablesById[table.id] = tableCompletion;

        table.columns.forEach((column) => {
          const id = `${table.id}.${column.name}`;
          columnsById[id] = {
            name: column.name,
            value: column.name,
            meta: 'column',
            score: 0,
          };
        });

        const columnMatches = Object.values(columnsById);

        // Add table entry for schema
        if (table.schema) {
          if (!columnWantedDotMatches[table.schema.toLowerCase()]) {
            columnWantedDotMatches[table.schema.toLowerCase()] = [];
          }
          columnWantedDotMatches[table.schema.toLowerCase()].push(
            tableCompletion
          );

          const schemaTable = `${table.schema.toLowerCase()}.${table.name.toLowerCase()}`;
          if (!columnWantedDotMatches[schemaTable]) {
            columnWantedDotMatches[schemaTable] = [];
          }
          columnWantedDotMatches[schemaTable] = columnWantedDotMatches[
            schemaTable
          ].concat(columnMatches);
        }

        const tablename = table.name.toLowerCase();
        if (!columnWantedDotMatches[tablename]) {
          columnWantedDotMatches[tablename] = [];
        }
        columnWantedDotMatches[tablename] = columnWantedDotMatches[
          tablename
        ].concat(columnMatches);
      });

      // If dottedIdenfier and want a table, show suggestions for a schema
      // At this point the only thing we can suggest on would be tables for a schema.
      // Column suggestions are not wanted.
      if (dottedIdentifier && wanted === 'TABLE') {
        return callback(null, tablesBySchema[dottedIdentifier]);
      }

      // If dottedIdenfier and wanting a column, show suggestions for the following completions
      // This could be `schema.` and we need a table
      // This could be `tablename.` and we need a column
      // This could be `schema.tablename.` and we need a column
      if (dottedIdentifier && wanted === 'COLUMN') {
        return callback(null, columnWantedDotMatches[dottedIdentifier]);
      }

      // If no dottedIdenfier and want table show all tables and schemas
      if (!dottedIdentifier && wanted === 'TABLE') {
        return callback(null, initialTableWantedSuggestions);
      }

      // If no dottedIdenfier and want column show all suggestions for tables referenced in editor
      // TODO also include alias?
      if (!dottedIdentifier && wanted === 'COLUMN') {
        const acCompletions = Object.values(schemasById)
          .concat(Object.values(tablesById))
          .concat(Object.values(columnsById));
        return callback(null, acCompletions);
      }

      // This should not be reached but just in case
      return callback(null, null);
    },
  };

  ace.acequire(['ace/ext/language_tools'], (langTools: any) => {
    langTools.setCompleters([myCompleter]);
    // Note - later on might be able to set a completer for specific editor like:
    // editor.completers = [staticWordCompleter]
  });
}
