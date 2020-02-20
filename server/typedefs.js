/**
 * A collection of data access objects
 * @typedef {Object} Models
 * @property {import('./models/connectionAccesses')} connectionAccesses - connection accesses DAO
 * @property {import('./models/connections')} connections - connections DAO
 * @property {import('./models/queries')} queries - queries DAO
 * @property {import('./models/queryHistory')} queryHistory - queryHistory DAO
 * @property {import('./models/resultCache')} resultCache - resultCache DAO
 * @property {import('./models/schemaInfo')} schemaInfo - schemaInfo DAO
 * @property {import('./models/users')} users - users DAO
 */

/**
 * The expressjs Request object plus decorations
 * @typedef {Object} Req
 * @property {Models} models - Collection of data access objects
 */
