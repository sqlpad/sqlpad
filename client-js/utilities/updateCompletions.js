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
    const schemaDot = schema.toLowerCase() + '.'
    if (!dottedMatches[schemaDot]) dottedMatches[schemaDot] = []

    Object.keys(schemaInfo[schema]).forEach(table => {
      const schemaTableDot = schema.toLowerCase() + '.' + table.toLowerCase() + '.'
      const tableDot = table.toLowerCase() + '.'
      if (!dottedMatches[schemaTableDot]) dottedMatches[schemaTableDot] = []
      if (!dottedMatches[tableDot]) dottedMatches[tableDot] = []

      const tableCompletion = {name: table, value: table, score: 0, meta: 'table/view'}
      tableCompletions.push(tableCompletion)
      dottedMatches[schemaDot].push(tableCompletion)

      const columns = schemaInfo[schema][table]
      columns.forEach(column => {
        const columnCompletion = {name: column.column_name, value: column.column_name, score: 0, meta: column.data_type}
        columnCompletions.push(columnCompletion)
        dottedMatches[tableDot].push(columnCompletion)
        dottedMatches[schemaTableDot].push(columnCompletion)
      })
    })
  })

  const tableWantedCompletions = schemaCompletions.concat(tableCompletions).concat(keywordCompletions)
  const columnWantedCompletions = tableWantedCompletions.concat(columnCompletions)

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
        return callback(null, dottedMatches[dotMatch.toLowerCase()])
      }

      // TODO consider tables in query for autocomplete later

      for (let i = currentTokens.length - 1; i >= 0; i--) {
        const token = currentTokens[i]
        if (columnWantedKeywords.indexOf(token) >= 0) {
          debug('want column')
          return callback(null, columnWantedCompletions)
        }
        if (tableWantedKeywords.indexOf(token) >= 0) {
          debug('want table')
          return callback(null, tableWantedCompletions)
        }
      }

      // TODO search previous rows for keywords to figure out where cursor is in a query
      // const currentRow = pos.row
      // let tokens = []
      // for (let r = 0; r <= currentRow; r++) {
      //   const lineTokens = session.getDocument().getLine(r).split(/\s+/).map(t => t.toUpperCase())
      //   tokens = tokens.concat(lineTokens)
      // }
      // console.log(tokens)

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
