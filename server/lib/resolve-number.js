/**
 * Check if number is an integer, otherwise return default
 * @param {object} num
 * @param {number} defaultValue
 * @returns
 */
function resolveNumber(num, defaultValue) {
  if (num == null) return defaultValue;
  if (typeof num === 'string') num = Number.parseInt(num, 10);
  if (typeof num !== 'number') return defaultValue;
  if (!Number.isFinite(num)) return defaultValue;
  return num;
}

/**
 * Check if number is a positive integer, otherwise return default
 * @param {object} num
 * @param {number} defaultValue
 * @returns
 */
function resolvePositiveNumber(num, defaultValue) {
  const posNum = resolveNumber(num, defaultValue);
  if (posNum > 0) return posNum;
  return defaultValue;
}

module.exports = {
  resolveNumber,
  resolvePositiveNumber,
};
