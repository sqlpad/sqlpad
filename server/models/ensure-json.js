import appLog from '../lib/app-log.js';

/**
 * If value is string try and parse JSON
 * Required to follow up on JSON fields when using SQL Server, as they are returned as string
 * @param {*} value
 */
export default function ensureJson(value) {
  let final = value;
  if (typeof value === 'string') {
    try {
      final = JSON.parse(value);
    } catch (error) {
      appLog.warn(error, 'Error parsing JSON for SQL Server');
    }
  }
  return final;
}
