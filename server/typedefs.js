/**
 * The expressjs Request object plus decorations
 * @typedef {Object} Req
 * @property {Object} config
 * @property {Object} log - Pino web logger. Same as appLog but no setLevel
 * @property {import('./lib/logger')} appLog - Pino app logger
 * @property {import('./models')} models - Collection of data access objects
 */
