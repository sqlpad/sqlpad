var runQuery = require('../lib/run-query.js');
var _ = require('lodash');

module.exports = function (app) {
    
    var db = app.get('db');
    var decipher = app.get('decipher');
    
    app.get('/schema-info/:connectionId', function (req, res) {
        db.connections.findOne({_id: req.params.connectionId}, function (err, connection) {
            if (!err && connection) {
                connection.username = decipher(connection.username);
                connection.password = decipher(connection.password);
                
                if (connection.driver !== "vertica") {

                    var tableAndColumnSql = "SELECT t.table_type, t.table_schema, t.table_name, c.column_name, c.data_type, c.is_nullable "
                                        + " FROM INFORMATION_SCHEMA.tables t "
                                        + " JOIN INFORMATION_SCHEMA.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name "
                                        + " WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog') "
                                        + " ORDER BY t.table_type, t.table_schema, t.table_name, c.ordinal_position";
                } else {
                    var tableAndColumnSql = "SELECT (CASE vat.table_type WHEN 'TABLE' THEN 'BASE TABLE' ELSE 'TABLE' END) AS table_type, "
                                        + " vt.table_schema, vt.table_name, vc.column_name, vc.data_type, "
                                        + " (CASE vc.is_nullable WHEN 't' THEN 'YES' ELSE 'NO' END)  as is_nullable "
                                        + " FROM V_CATALOG.TABLES vt "
                                        + " JOIN V_CATALOG.ALL_TABLES vat ON vt.table_id = vat.table_id "
                                        + " JOIN V_CATALOG.COLUMNS vc ON vt.table_schema = vc.table_schema AND vt.table_name = vc.table_name "
                                        + " WHERE vt.table_schema NOT IN ('V_CATALOG') AND vat.table_type = 'TABLE' "
                                        + " ORDER BY vat.table_type, vt.table_schema, vt.table_name, vc.ordinal_position";
                }
                                    
                var tree = {};
                
                runQuery(tableAndColumnSql, connection, function (err, results) {
                    if (err) {
                        console.log(err);
                        res.send({success: false});
                    } else {
                        var byTableType = _.groupBy(results.rows, "table_type");
                        for (var tableType in byTableType) {
                            tree[tableType] = {};
                            var bySchema = _.groupBy(byTableType[tableType], "table_schema");
                            for (var schema in bySchema) {
                                tree[tableType][schema] = {};
                                var byTableName = _.groupBy(bySchema[schema], "table_name");
                                for (var tableName in byTableName) {
                                    tree[tableType][schema][tableName] = byTableName[tableName];
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
                        res.send({tree: tree, success: true});
                    }
                });
            } else {
                res.send({tree: {}, success: false});
            }
            
        });
    });
};
