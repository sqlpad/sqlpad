var runQuery = require('../lib/run-query.js');
var _ = require('lodash');
var fs = require('fs');

var sqlSchemaPostgres = fs.readFileSync('./sql/schema-postgres.sql', {encoding: 'utf8'});
var sqlSchemaVertica = fs.readFileSync('./sql/schema-vertica.sql', {encoding: 'utf8'});
var sqlSchemaCrate = fs.readFileSync('./sql/schema-crate.sql', {encoding: 'utf8'});
var sqlSchemaStandard = fs.readFileSync('./sql/schema-standard.sql', {encoding: 'utf8'});

module.exports = function (app, router) {

    var db = app.get('db');

    router.get('/schema-info/:connectionId', function (req, res) {
        var reload = req.query.reload === "true";
        var showSchemaCopyButton = false;
        var tree = {};
        var cacheKey;
        var connection;
        
        getSchemaCopyButtonConfig();
        
        function getSchemaCopyButtonConfig () {
            db.config.findOne({key: "showSchemaCopyButton"}, function (err, config) {
                showSchemaCopyButton = (config && config.value.toLowerCase() === "true");
                getConnection();
            });
        }
        
        function getConnection () {
            db.connections.findOne({_id: req.params.connectionId}, function (err, conn) {
                if (!err && conn) {
                    connection = conn;
                    cacheKey = "schemaCache:" + req.params.connectionId;
                    getCache();
                } else {
                    res.render('schema-info', {tree: tree, showSchemaCopyButton: showSchemaCopyButton});
                }
            });
        }
        
        function getCache() {
            db.cache.findOne({cacheKey: cacheKey}, function (err, cache) {
                if (!cache || reload) {

                    var decipher = app.get('decipher');

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
                            res.send({success: false});
                        } else {
                            var byTableType = _.groupBy(results.rows, "table_type");
                            for (var tableType in byTableType) {
                                if (byTableType.hasOwnProperty(tableType)) {
                                    tree[tableType] = {};
                                    var bySchema = _.groupBy(byTableType[tableType], "table_schema");
                                    for (var schema in bySchema) {
                                        if (bySchema.hasOwnProperty(schema)) {
                                            tree[tableType][schema] = {};
                                            var byTableName = _.groupBy(bySchema[schema], "table_name");
                                            for (var tableName in byTableName) {
                                                if (byTableName.hasOwnProperty(tableName)) {
                                                    tree[tableType][schema][tableName] = byTableName[tableName];
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
                            updateCacheAndRender();
                        }
                    });
                } else {
                    res.render('schema-info', {tree: JSON.parse(cache.schema), showSchemaCopyButton: showSchemaCopyButton});
                }
            });
        }
        
        
        function updateCacheAndRender () {
            if (!_.isEmpty(tree)) {
                var params = {
                    cacheKey: cacheKey,
                    schema: JSON.stringify(tree)
                };
                db.cache.update({cacheKey: cacheKey}, params, {upsert: true}, function () {
                    res.render('schema-info', {tree: tree, showSchemaCopyButton: showSchemaCopyButton});
                });
            } else {
                res.render('schema-info', {tree: tree, showSchemaCopyButton: showSchemaCopyButton});
            }
        }
        
    });
};
