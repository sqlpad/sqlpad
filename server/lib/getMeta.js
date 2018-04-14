const _ = require('lodash')

/**
 * Derive whether value is a number number or number as a string
 * If value is a string, it'll determine whether the string is numeric
 * Zero-padded number strings are not considered numeric
 * @param {*} value
 */
function isNumeric(value) {
  if (_.isNumber(value)) {
    return true
  }
  if (_.isString(value)) {
    if (!isFinite(value)) {
      return false
    }
    // str is a finite number, but not all number strings should be numbers
    // If the string starts with 0, is more than 1 character, and does not have a period, it should stay a string
    // It could be an account number for example
    if (value[0] === '0' && value.length > 1 && value.indexOf('.') === -1) {
      return false
    }

    return true
  }
  return false
}

/**
 * Iterate over collection of rows and derive metadata
 * @param {array<object>} rows
 */
module.exports = function getMeta(rows) {
  const meta = {}

  rows.forEach(row => {
    _.forOwn(row, (value, key) => {
      if (!meta[key]) {
        meta[key] = {
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
      if (!meta[key].datatype) {
        if (_.isDate(value)) {
          meta[key].datatype = 'date'
        } else if (isNumeric(value)) {
          meta[key].datatype = 'number'
        } else if (_.isString(value)) {
          meta[key].datatype = 'string'
        }
      }

      // if the datatype is number-like,
      // we should check to see if it ever changes to a string
      // this is hacky, but sometimes data will be
      // a mix of number-like and strings that aren't number like
      // in the event that we get some data that's NOT NUMBER LIKE,
      // then we should *really* be recording this as string
      if (
        meta[key].datatype === 'number' &&
        _.isString(value) &&
        !isNumeric(value)
      ) {
        meta[key].datatype = 'string'
      }

      // For strings, get max length of the string for display purposes
      if (meta[key].datatype === 'string' && _.isString(value)) {
        if (meta[key].maxValueLength < value.length) {
          meta[key].maxValueLength = value.length
        }
      }

      // if we have a value and are dealing with a number or date, we should get min and max
      if (meta[key].datatype === 'number' && isNumeric(value)) {
        value = Number(value)
        // if we haven't yet defined a max and this row contains a number
        if (!meta[key].max) {
          meta[key].max = value
        } else if (value > meta[key].max) {
          // otherwise this field in this row contains a number, and we should see if its bigger
          meta[key].max = value
        }
        // then do the same thing for min
        if (!meta[key].min) {
          meta[key].min = value
        } else if (value < meta[key].min) {
          meta[key].min = value
        }
      }

      if (meta[key].datatype === 'date' && _.isDate(value)) {
        // if we haven't yet defined a max and this row contains a number
        if (!meta[key].max) {
          meta[key].max = value
        } else if (value > meta[key].max) {
          // otherwise this field in this row contains a number, and we should see if its bigger
          meta[key].max = value
        }
        // then do the same thing for min
        if (!meta[key].min) {
          meta[key].min = value
        } else if (value < meta[key].min) {
          meta[key].min = value
        }
      }
    })
  })

  return meta
}
