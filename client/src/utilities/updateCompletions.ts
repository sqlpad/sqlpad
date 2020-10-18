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

type CompletionType = 'schema' | 'table' | 'column';

/**
 * AceCompletion is the object format expected by Ace editor
 */
type AceCompletion = {
  // Unique identifier for the completion as full-path
  id: string;
  // Type of entry
  type: CompletionType;
  // Lowercase name of item
  name: string;
  // Original value to complete. Used by Ace.
  value: string;
  // Higher the score the more relevant. Used by Ace
  score: number;
  // Greyed out text to show in prompt. Used by Ace
  meta: string;
  // pointers to parent objects if applicable
  schemaId?: string;
  tableId?: string;
  schemaCompletion?: AceCompletion;
  columnCompletions?: AceCompletion[];
};

/**
 * Updates global completions for ace editors in use.
 * @param  connectionSchema
 */
function updateCompletions(connectionSchema: ConnectionSchema) {
  debug('updating completions');
  debug(connectionSchema);

  if (connectionSchema === null || connectionSchema === undefined) {
    return;
  }

  const initialTableWantedSuggestions: AceCompletion[] = [];
  const tablesBySchema: Record<string, AceCompletion[]> = {};

  const tablesById: Record<string, AceCompletion> = {};
  // last one wins since names can be duplicated across schemas
  const tablesByName: Record<string, AceCompletion> = {};

  if (connectionSchema.schemas) {
    connectionSchema.schemas.forEach((schema) => {
      const schemaCompletion: AceCompletion = {
        id: schema.name.toLowerCase(),
        name: schema.name.toLowerCase(),
        type: 'schema',
        value: schema.name,
        score: 0,
        meta: 'schema',
      };
      initialTableWantedSuggestions.push(schemaCompletion);

      schema.tables.forEach((table) => {
        const columnCompletions: AceCompletion[] = table.columns.map(
          (column) => {
            return {
              id: `${schema.name}.${table.name}.${column.name}`.toLowerCase(),
              name: column.name.toLowerCase(),
              type: 'column',
              value: column.name,
              score: 0,
              meta: `${column.dataType} ${column.description || ''}`.trim(),
            };
          }
        );

        const tableCompletion: AceCompletion = {
          id: `${schema.name}.${table.name}`.toLowerCase(),
          name: table.name.toLowerCase(),
          type: 'table',
          value: table.name,
          score: 0,
          meta: `table ${table.description || ''}`.trim(),
          schemaCompletion: schemaCompletion,
          columnCompletions,
        };

        initialTableWantedSuggestions.push(tableCompletion);
        if (!tablesBySchema[schemaCompletion.name]) {
          tablesBySchema[schemaCompletion.name] = [];
        }
        tablesBySchema[schemaCompletion.name].push(tableCompletion);
        tablesByName[tableCompletion.name] = tableCompletion;
        tablesById[tableCompletion.id] = tableCompletion;
      });
    });
  } else if (connectionSchema.tables) {
    connectionSchema.tables.forEach((table) => {
      const columnCompletions: AceCompletion[] = table.columns.map((column) => {
        return {
          id: `${table.name}.${column.name}`.toLowerCase(),
          name: column.name.toLowerCase(),
          type: 'column',
          value: column.name,
          score: 0,
          meta: `${column.dataType} ${column.description || ''}`.trim(),
        };
      });

      const tableCompletion: AceCompletion = {
        id: table.name.toLowerCase(),
        name: table.name.toLowerCase(),
        type: 'table',
        value: table.name,
        score: 0,
        meta: `table ${table.description || ''}`.trim(),
        columnCompletions,
      };
      initialTableWantedSuggestions.push(tableCompletion);
      tablesByName[tableCompletion.name] = tableCompletion;
      tablesById[tableCompletion.id] = tableCompletion;
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
      // get tokens leading up to the cursor to figure out context
      // depending on where we are we either want tables or we want columns
      const tableWantedKeywords = ['from', 'join'];
      const columnWantedKeywords = ['select', 'where', 'group', 'having', 'on'];
      let priorKeyword = '';

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
            priorKeyword = token;
            wanted = 'COLUMN';
            r = 0;
            break;
          }
          if (tableWantedKeywords.indexOf(token) >= 0) {
            priorKeyword = token;
            wanted = 'TABLE';
            r = 0;
            break;
          }
        }
      }
      debug(`Want ${wanted} because keyword: ${priorKeyword}`);

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
        .map((t: string) => {
          const [p1, p2] = t.toLowerCase().split('.');
          if (p2) {
            return `${p1}.${p2}`;
          }
          return p1;
        });

      // First find any references of schemas or tables in tokens
      // Anything matched will be added to relevant completions
      let foundTablesById: Record<string, AceCompletion> = {};

      allTokens.forEach((token) => {
        const tableById = tablesById[token];
        const tableByName = tablesByName[token];
        if (tableById && tableByName && tableById.id === tableByName.id) {
          foundTablesById[tableById.id] = tableById;
        } else {
          if (tableById) {
            foundTablesById[tableById.id] = tableById;
          }
          if (tableByName) {
            foundTablesById[tableByName.id] = tableByName;
          }
        }
      });

      // Iterate over the indexed tables and schemas and add column completions
      // When wanting a column value, schema and tables are also appropriate for autocomplete
      const schemasById: Record<string, AceCompletion> = {};
      const columnsById: Record<string, AceCompletion> = {};

      const columnDotMatches: Record<string, AceCompletion[]> = {};

      Object.values(foundTablesById).forEach((table) => {
        if (table.schemaCompletion) {
          schemasById[table.schemaCompletion.id] = table.schemaCompletion;
        }
        table.columnCompletions?.forEach((columnCompletion) => {
          columnsById[columnCompletion.id] = columnCompletion;
        });

        // Add table entry for schema
        if (table.schemaCompletion) {
          if (!columnDotMatches[table.schemaCompletion.id]) {
            columnDotMatches[table.schemaCompletion.id] = [];
          }
          columnDotMatches[table.schemaCompletion.id].push(table);

          if (!columnDotMatches[table.id]) {
            columnDotMatches[table.id] = [];
          }
          if (table.columnCompletions) {
            columnDotMatches[table.id] = table.columnCompletions;
          }
        }

        if (!columnDotMatches[table.name]) {
          columnDotMatches[table.name] = [];
        }
        if (table.columnCompletions) {
          columnDotMatches[table.name] = columnDotMatches[table.name].concat(
            table.columnCompletions
          );
        }
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
        let acCompletions = (columnDotMatches[dottedIdentifier] || []).map(
          (c) => {
            return { value: c.value, meta: c.meta, score: 1 };
          }
        );

        // user might be trying for a table prior to using it in SELECT
        // eg `SELECT schemaname.` should get tables
        if (priorKeyword === 'select') {
          acCompletions = acCompletions.concat(
            (tablesBySchema[dottedIdentifier] || []).map((c) => {
              return { value: c.value, meta: c.meta, score: 0 };
            })
          );
        }

        return callback(null, acCompletions);
      }

      // If no dottedIdenfier and want table show all tables and schemas
      if (!dottedIdentifier && wanted === 'TABLE') {
        return callback(null, initialTableWantedSuggestions);
      }

      // If no dottedIdenfier and want column show all suggestions for tables referenced in editor
      if (!dottedIdentifier && wanted === 'COLUMN') {
        let acCompletions = Object.values(schemasById)
          .concat(Object.values(foundTablesById))
          .concat(Object.values(columnsById))
          .map((c) => {
            return {
              value: c.value,
              meta: c.meta,
              score: 1,
            };
          });

        // Add schemas and tables not for found tables
        // user might be trying for a table prior to using it in SELECT
        // eg `SELECT schemaname` or `SELECT tablename` should be assisted
        if (priorKeyword === 'select') {
          acCompletions = acCompletions.concat(
            initialTableWantedSuggestions.map((c) => {
              return {
                value: c.value,
                meta: c.meta,
                score: 0,
              };
            })
          );
        }

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
