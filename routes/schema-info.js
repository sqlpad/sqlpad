var runQuery = require('../lib/run-query.js');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var config = require('../lib/config.js');
var db = require('../lib/db.js');
var decipher = require('../lib/decipher.js');

var sqldir = path.resolve(__dirname + '/../sql/');

var sqlSchemaPostgres = fs.readFileSync(sqldir + '/schema-postgres.sql', {encoding: 'utf8'});
var sqlSchemaVertica = fs.readFileSync(sqldir + '/schema-vertica.sql', {encoding: 'utf8'});
var sqlSchemaCrate = fs.readFileSync(sqldir + '/schema-crate.sql', {encoding: 'utf8'});
var sqlSchemaStandard = fs.readFileSync(sqldir + '/schema-standard.sql', {encoding: 'utf8'});

module.exports = function (app, router) {

    router.get('/schema-info/:connectionId', 
        function initLocals (req, res, next) {
            res.locals.reload = req.query.reload === "true";
            res.locals.tree = {};
            res.locals.cacheKey;
            res.locals.connection;
            res.locals.SHOW_SCHEMA_COPY_BUTTON = config.get('showSchemaCopyButton');
            res.locals.connectionId = req.params.connectionId;
            next()
        },
        
        function getConnection (req, res, next) {
            db.connections.findOne({_id: res.locals.connectionId}, function (err, conn) {
                if (!err && conn) {
                    res.locals.connection = conn;
                    res.locals.cacheKey = "schemaCache:" + res.locals.connectionId;
                    next();
                } else {
                    res.render('schema-info', {tree: tree, showSchemaCopyButton: res.locals.SHOW_SCHEMA_COPY_BUTTON});
                }
            });
        },

        function getCache (req, res, next) {
            db.cache.findOne({cacheKey: res.locals.cacheKey}, function (err, cache) {
                if (!cache || res.locals.reload) {
                    var connection = res.locals.connection;

                    connection.username = decipher(connection.username);
                    connection.password = decipher(connection.password);
                    connection.maxRows = typeof Number.MAX_SAFE_INTEGER == 'undefined' ? 9007199254740991 : Number.MAX_SAFE_INTEGER;

                    var tableAndColumnSql = "";
                    if (connection.driver == "vertica") {
                        tableAndColumnSql = sqlSchemaVertica;
                    } else if (connection.driver == "crate") {
                        tableAndColumnSql = sqlSchemaCrate;
                    } else if (connection.driver == "postgres") {
                        tableAndColumnSql = sqlSchemaPostgres;
                    } else {
                        tableAndColumnSql = sqlSchemaStandard
                    }

                    runQuery(tableAndColumnSql, connection, function (err, results) {
                        if (err) {
                            console.log(err);
                            return res.send({success: false});
                        } 
                        var byTableType = _.groupBy(results.rows, "table_type");
                        for (var tableType in byTableType) {
                            if (byTableType.hasOwnProperty(tableType)) {
                                res.locals.tree[tableType] = {};
                                var bySchema = _.groupBy(byTableType[tableType], "table_schema");
                                for (var schema in bySchema) {
                                    if (bySchema.hasOwnProperty(schema)) {
                                        res.locals.tree[tableType][schema] = {};
                                        var byTableName = _.groupBy(bySchema[schema], "table_name");
                                        for (var tableName in byTableName) {
                                            if (byTableName.hasOwnProperty(tableName)) {
                                                res.locals.tree[tableType][schema][tableName] = byTableName[tableName];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        /*
                        So at this point, tree should look like this:
                        tree: {
                            "table": {
                                "dbo": {
                                    "tablename": [
                                        {
                                            column_name: "the column name",
                                            data_type: "string",
                                            is_nullable: "no"
                                        }
                                    ]
                                }
                            }
                        }
                        */
                        next();
                    });
                } else {
                    return res.render('schema-info', {tree: JSON.parse(cache.schema), showSchemaCopyButton: res.locals.SHOW_SCHEMA_COPY_BUTTON});
                }
            })
        },
        
        function updateCacheAndRender (req, res, next) {
            if (!_.isEmpty(res.locals.tree)) {
                var params = {
                    cacheKey: res.locals.cacheKey,
                    schema: JSON.stringify(res.locals.tree)
                };
                db.cache.update({cacheKey: res.locals.cacheKey}, params, {upsert: true}, function () {
                    res.render('schema-info', {tree: res.locals.tree, showSchemaCopyButton: res.locals.SHOW_SCHEMA_COPY_BUTTON});
                });
            } else {
                res.render('schema-info', {tree: tree, showSchemaCopyButton: res.locals.SHOW_SCHEMA_COPY_BUTTON});
            }
        }      
    );
};
