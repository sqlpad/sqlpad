/*
    Unlike other models, QueryResult does not have a db layer built in
    It is more a formalization of how the result of a query should be
    represented regardless of the driver behind things.
    Anything that handles a query result (be it a cache file, grid, chart)
    should expect the data to be in this format
*/
const uuid = require('uuid')
const getMeta = require('../lib/getMeta')

function QueryResult() {
  this.id = uuid.v1()
  this.cacheKey = null
  this.startTime = null
  this.stopTime = null
  this.queryRunTime = null

  // Array of field names
  this.fields = []

  // Signals whether results were truncated due to MAX_ROWS
  this.incomplete = false

  this.meta = {
    /*
    fieldname: {
        datatype: '',       // date, number or string
        max: 0,             // if datatype is a number or date
        min: 0,             // if datatype is number or date
        maxValueLength: 0   // populated if string
    }
    */
  }

  // Array of row objects [{col1: value, col2: value}]
  this.rows = []

  this.startTime = new Date()
  this.stopTime = undefined
}

QueryResult.prototype.finalize = function finalize() {
  this.stopTime = new Date()
  this.queryRunTime = this.stopTime - this.startTime
  this.meta = getMeta(this.rows)
  this.fields = Object.keys(this.meta)
}

QueryResult.prototype.addRows = function addRows(rows) {
  if (rows && rows.length) {
    rows.forEach(row => this.addRow(row))
  }
}

QueryResult.prototype.addRow = function addRow(row) {
  this.rows.push(row)
}

module.exports = QueryResult
