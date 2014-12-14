/*

"component" for db schema info

EXAMPLE: 

var DbInfo = require('this-file.js');
var dbInfo = new DbInfo();
dbInfo.getConnectionId();



*/

var $ = require('jquery');

var DbInfo = function () {
    var me = this;
    this.render();
    $('#connection').change(me.render);
};

module.exports = DbInfo;

DbInfo.prototype.getConnectionId = function () {
    return $('#connection').val();
};

DbInfo.prototype.render = function () {
    $('#panel-db-info').empty();
    var connectionId = $('#connection').val();
    if (connectionId) {
        $.getJSON("/schema-info/" + connectionId, function (data) {
            if (data.success) {
                var tree = data.tree;
                var $root = $('<ul class="schema-info">').appendTo('#panel-db-info');
                for (var tableType in tree) {
                    var tableTypeName;
                    if (tableType == "BASE TABLE") {
                        tableTypeName = "Tables";
                    } else if (tableType == "VIEW") {
                        tableTypeName = "Views";
                    } else {
                        tableTypeName = tableType;
                    }
                    var $tableType = $('<li><a href="#">' + tableTypeName + '</a></li>').appendTo($root);
                    var $tableTypeUl = $('<ul>').appendTo($tableType);
                    for (var schema in tree[tableType]) {
                        var $schema = $('<li><a href="#">' + schema + '</a></li>').appendTo($tableTypeUl);
                        var $schemaUl = $('<ul>').appendTo($schema);
                        for (var tableName in tree[tableType][schema]) {
                            var $tableName = $('<li><a href="#">' + tableName + '</a></li>').appendTo($schemaUl);
                            var $tableNameUl = $('<ul>').appendTo($tableName);
                            var columns = tree[tableType][schema][tableName];
                            for (var i=0; i < columns.length; i++) {
                                var $column = $('<li>' + columns[i].column_name + " <span class='data-type'>(" + columns[i].data_type + ')</span></li>').appendTo($tableNameUl);
                            }
                        }
                    }
                }
                $('.schema-info').find('ul').find('ul').hide(); //find('ul').hide();
                $('.schema-info').find('li').click(function (e) {
                    $(this).children('ul').toggle();
                    e.stopPropagation();
                });
            } else {
                $('<ul class="schema-info"><li>Problem getting Schema Info</li></ul>').appendTo('#panel-db-info');
            }
        });
    }
};

