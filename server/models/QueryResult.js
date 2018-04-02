/*
    Unlike other models, QueryResult does not have a db layer built in
    It is more a formalization of how the result of a query should be
    represented regardless of the driver behind things.
    Anything that handles a query result (be it a cache file, grid, chart)
    should expect the data to be in this format
*/
const _ = require('lodash')
const uuid = require('uuid')

function isNumberLike(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function QueryResult() {
  this.id = uuid.v1()
  this.cacheKey = null
  this.startTime = null
  this.stopTime = null
  this.queryRunTime = null
  this.processedInitialHeader = false

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

QueryResult.prototype.finalize = function() {
  this.stopTime = new Date()
  this.queryRunTime = this.stopTime - this.startTime
}

QueryResult.prototype.addRows = function QueryResultAddRows(rows) {
  if (rows && rows.length) {
    rows.forEach(row => this.addRow(row))
  }
}

QueryResult.prototype.addRow = function QueryResultAddRow(row) {
  this.rows.push(row)
  _.forOwn(row, (value, key) => {
    // if this is first row added, record fields in fields array
    if (!this.processedInitialHeader) {
      this.fields.push(key)
    }

    if (!this.meta[key]) {
      this.meta[key] = {
        datatype: null,
        max: null,
        min: null,
        maxValueLength: 0
      }
    }

    // if there is no value none of what follows will be helpful
    if (value == null) {
      return
    }

    // if we don't have a data type and we have a value yet lets try and figure it out
    if (!this.meta[key].datatype) {
      if (_.isDate(value)) {
        this.meta[key].datatype = 'date'
      } else if (_.isNumber(value)) {
        this.meta[key].datatype = 'number'
      } else if (isNumberLike(value)) {
        // BIGINT and aggregate results sometimes come in as strings depending on db driver
        // if they contain a numeric value we want to treat them as a numeric
        this.meta[key].datatype = 'number'
      } else if (_.isString(value)) {
        this.meta[key].datatype = 'string'
        if (this.meta[key].maxValueLength < value.length) {
          this.meta[key].maxValueLength = value.length
        }
      }
    }

    // if the datatype is number-like,
    // we should check to see if it ever changes to a string
    // this is hacky, but sometimes data will be
    // a mix of number-like and strings that aren't number like
    // in the event that we get some data that's NOT NUMBER LIKE,
    // then we should *really* be recording this as string
    // also - if first character is 0 revert back to string
    if (this.meta[key].datatype === 'number' && _.isString(value)) {
      if (!isNumberLike(value) || value[0] === '0') {
        this.meta[key].datatype = 'string'
        this.meta[key].max = null
        this.meta[key].min = null
      }
    }

    // if we have a value and are dealing with a number or date, we should get min and max
    if (this.meta[key].datatype === 'number' && isNumberLike(value)) {
      value = Number(value)
      // if we haven't yet defined a max and this row contains a number
      if (!this.meta[key].max) {
        this.meta[key].max = value
      } else if (value > this.meta[key].max) {
        // otherwise this field in this row contains a number, and we should see if its bigger
        this.meta[key].max = value
      }
      // then do the same thing for min
      if (!this.meta[key].min) {
        this.meta[key].min = value
      } else if (value < this.meta[key].min) {
        this.meta[key].min = value
      }
    }

    if (this.meta[key].datatype === 'date' && _.isDate(value)) {
      // if we haven't yet defined a max and this row contains a number
      if (!this.meta[key].max) {
        this.meta[key].max = value
      } else if (value > this.meta[key].max) {
        // otherwise this field in this row contains a number, and we should see if its bigger
        this.meta[key].max = value
      }
      // then do the same thing for min
      if (!this.meta[key].min) {
        this.meta[key].min = value
      } else if (value < this.meta[key].min) {
        this.meta[key].min = value
      }
    }
  })

  // if we haven't processed the header yet we have now
  if (!this.processedInitialHeader) {
    this.processedInitialHeader = true
  }
}

module.exports = QueryResult
