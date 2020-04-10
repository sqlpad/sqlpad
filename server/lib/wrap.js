// Because expressjs doesn't support promises out of the box
// https://expressjs.com/en/advanced/best-practice-performance.html#handle-exceptions-properly
const wrap = fn => (...args) => fn(...args).catch(args[2]);

module.exports = wrap;
