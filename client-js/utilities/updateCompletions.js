// import various ace editor things
var ace = require('brace')
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import 'brace/ext/searchbox'
import 'brace/ext/language_tools'

module.exports = updateCompletions

// There's stuff below that logs to console a lot
// documentation on this autocompletion is light
// and you may find it helpful to print some vars out during dev
const DEBUG_ON = true

function debug () {
  if (DEBUG_ON) console.log.apply(null, arguments)
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
function updateCompletions (schemaInfo) {
  debug('updating completions')
  debug(schemaInfo)
  const keywordCompletions = []
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INNER', 'FULL', 'LEFT', 'RIGHT', 'OUTER', 'JOIN', 'ON', 'GROUP', 'BY', 'HAVING']
  keywords.forEach(k => keywordCompletions.push({name: k, value: k, score: 100, meta: 'keyword'}))

  // In ace, a . resets the prefix var passed to completer
  // we'll need autocomplete on each thing by itself when user uses .
  // look up previous chain to figure out what hierarchy we're dealing with
  // and change autocomplete deal with that
  // for now we pre-assemble entire buckets of all schemas/tables/columns
  // these handle autocompletes with no dot
  // NOTE sqlpad is also firing autocomplete on every keypress instead of using live autocomplete
  const schemaCompletions = []
  const tableCompletions = []
  const columnCompletions = []

  // we also should create an index of dotted autocompletes.
  // given a precedingtoken as "sometable." or "someschema.table." we should be able to look up relevant completions
  // combos to support are...
  // schema.
  // schema.table.
  // table.
  const dottedMatches = {}

  Object.keys(schemaInfo).forEach(schema => {
    schemaCompletions.push({name: schema, value: schema, score: 0, meta: 'schema'})
    const schemaDot = schema.toUpperCase() + '.'
    if (!dottedMatches[schemaDot]) dottedMatches[schemaDot] = []

    Object.keys(schemaInfo[schema]).forEach(table => {
      const schemaTableDot = schema.toUpperCase() + '.' + table.toUpperCase() + '.'
      const tableDot = table.toUpperCase() + '.'
      if (!dottedMatches[schemaTableDot]) dottedMatches[schemaTableDot] = []
      if (!dottedMatches[tableDot]) dottedMatches[tableDot] = []

      const tableCompletion = {name: table, value: table, score: 0, meta: schema}
      tableCompletions.push(tableCompletion)
      dottedMatches[schemaDot].push(tableCompletion)

      const columns = schemaInfo[schema][table]
      columns.forEach(column => {
        const columnCompletion = {name: schema + table + column.column_name, value: column.column_name, score: 0, meta: table}
        columnCompletions.push(columnCompletion)
        dottedMatches[tableDot].push(columnCompletion)
        dottedMatches[schemaTableDot].push(columnCompletion)
      })
    })
  })

  const tableWantedCompletions = schemaCompletions.concat(tableCompletions).concat(keywordCompletions)

  const myCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
      // get tokens leading up to the cursor to figure out context
      // depending on where we are we either want tables or we want columns
      const tableWantedKeywords = ['FROM', 'JOIN']
      const columnWantedKeywords = ['SELECT', 'WHERE', 'GROUP', 'HAVING', 'ON']

      const currentLine = session.getDocument().getLine(pos.row)
      const currentTokens = currentLine.slice(0, pos.column).split(/\s+/).map(t => t.toUpperCase())
      const precedingCharacter = currentLine.slice(pos.column - 1, pos.column)
      const precedingToken = currentTokens[currentTokens.length - 1]

      // if there's no prefix, check to see if precedingCharacter is a .
      // if so, we need completions matched based on previous token
      debug('PREFIX: "%s"', prefix)
      debug('PRECEDING CHAR: "%s"', precedingCharacter)
      debug('PRECEDING TOKEN: "%s"', precedingToken)
      if (precedingToken.indexOf('.') >= 0) {
        let dotTokens = precedingToken.split('.')
        dotTokens.pop()
        const dotMatch = dotTokens.join('.') + '.'
        debug('Completing for "%s" even though we got "%s"', dotMatch, precedingToken)
        return callback(null, dottedMatches[dotMatch.toUpperCase()])
      }

      // if we are not dealing with a . match try to figure out where we are in the query
      // and whether the user would like columns or just tables
      // first look at the current line before cursor, then rest of lines beforehand
      const currentRow = pos.row
      for (let r = currentRow; r >= 0; r--) {
        let line = session.getDocument().getLine(r)
        let lineTokens
        // if dealing with current row only use stuff before cursor
        if (r === currentRow) {
          line = line.slice(0, pos.column)
        }
        lineTokens = line.split(/\s+/).map(t => t.toUpperCase())

        for (let i = lineTokens.length - 1; i >= 0; i--) {
          const token = lineTokens[i]
          if (columnWantedKeywords.indexOf(token) >= 0) {
            debug('want column')
            return callback(null, figureColumns(session, dottedMatches))
          }
          if (tableWantedKeywords.indexOf(token) >= 0) {
            debug('want table')
            return callback(null, tableWantedCompletions)
          }
        }
      }

      // No keywords found? User probably wants some keywords
      callback(null, keywordCompletions)
    }
  }

  ace.acequire(['ace/ext/language_tools'], (langTools) => {
    langTools.setCompleters([myCompleter])
    // Note - later on might be able to set a completer for specific editor like:
    // editor.completers = [staticWordCompleter]
  })
}





function figureColumns (session, dottedMatches) {
  const allTokens = session.getValue().split(/\s+/).map(t => t.toUpperCase())
  // remove last character from the dotmatch keys
  // the query will have occurences of schema.table not schema.table.
  const relevantDottedMatches = {}
  Object.keys(dottedMatches).map(dotKey => dotKey.slice(0, -1)).forEach(dotKey => {
    if (allTokens.indexOf(dotKey) >= 0) {
      relevantDottedMatches[dotKey] = dottedMatches[dotKey + '.']
    }
  })
  debug(relevantDottedMatches)
  let matches = []
  Object.keys(relevantDottedMatches).forEach(key => {
    matches = matches.concat(relevantDottedMatches[key])
  })
  debug(matches)
  return matches
}
