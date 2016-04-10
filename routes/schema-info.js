var runQuery = require('../lib/run-query.js');
var _ = require('lodash');

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

                    var tableAndColumnSql;

                    if (connection.driver == "vertica") {
                        tableAndColumnSql = "SELECT (CASE vat.table_type WHEN 'TABLE' THEN 'Tables' WHEN 'VIEW' THEN 'Views' ELSE vat.table_type END) AS table_type, "
                        + " vt.table_schema, vt.table_name, vc.column_name, vc.data_type, "
                        + " (CASE vc.is_nullable WHEN 't' THEN 'YES' ELSE 'NO' END)  as is_nullable "
                        + " FROM V_CATALOG.TABLES vt "
                        + " JOIN V_CATALOG.ALL_TABLES vat ON vt.table_id = vat.table_id "
                        + " JOIN V_CATALOG.COLUMNS vc ON vt.table_schema = vc.table_schema AND vt.table_name = vc.table_name "
                        + " WHERE vt.table_schema NOT IN ('V_CATALOG') AND vat.table_type = 'TABLE' "
                        + " ORDER BY vat.table_type, vt.table_schema, vt.table_name, vc.ordinal_position";
                    } else if (connection.driver == "crate") {
                        tableAndColumnSql = "select 'Tables' as table_type,'YES' as is_nullable, "
                                          + "tables.schema_name as table_schema, tables.table_name as table_name, column_name, "
                                          + "data_type "
                                          + "from information_schema.tables, information_schema.columns "
                                          + "WHERE tables.schema_name not in ('information_schema') "
                                          + "and columns.schema_name = tables.schema_name "
                                          + "and columns.table_name = tables.table_name";
                    } else {
                        tableAndColumnSql = "SELECT (CASE t.table_type WHEN 'BASE TABLE' THEN 'Tables' WHEN 'VIEW' THEN 'Views' ELSE t.table_type END) AS table_type, "
                        + " t.table_schema, t.table_name, c.column_name, c.data_type, c.is_nullable "
                        + " FROM INFORMATION_SCHEMA.tables t "
                        + " JOIN INFORMATION_SCHEMA.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name "
                        + " WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog') "
                        + " ORDER BY t.table_type, t.table_schema, t.table_name, c.ordinal_position";
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
