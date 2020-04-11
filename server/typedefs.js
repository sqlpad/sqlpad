/**
 * The expressjs Request object plus decorations
 * @typedef {Object} Req
 * @property {Object} config
 * @property {Object} log - Pino web logger. Same as appLog but no setLevel
 * @property {import('./lib/logger')} appLog - Pino app logger
 * @property {import('./models')} models - Collection of data access objects
 */

/**
 * Collection of utilities added to expressjs's res object
 * @typedef {object} SQLPadRes
 * @property {import('./lib/response-utils')} utils - utils for sending response
 */

/**
 * The expressjs Res object plus decorations
 * @typedef {import('express').Response & SQLPadRes} Res
 */
