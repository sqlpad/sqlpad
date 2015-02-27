/*

 "component" for db schema info

 EXAMPLE:

 var DbInfo = require('this-file.js');
 var dbInfo = new DbInfo();
 dbInfo.getConnectionId();



 */

var $ = require('jquery');

var DbInfo = function () {
    this.bindRender();
    this.bindReloadButton();
    this.getSchema(false);
};

module.exports = DbInfo;

DbInfo.prototype.getConnectionId = function () {
    return $('#connection').val();
};

DbInfo.prototype.bindRender = function () {
    var that = this;
    $('#connection').change(function () {
        that.getSchema();
    });
};

DbInfo.prototype.bindReloadButton = function () {
    var that = this;
    $('#btn-reload-schema').click(function () {
        that.getSchema(true);
    });
};

DbInfo.prototype.getSchema = function (reload) {
    $('#panel-db-info').empty();
    $('#btn-reload-schema').hide();
    var connectionId = $('#connection').val();
    if (connectionId) {
        var params = {
            reload: typeof reload != 'undefined' ? reload : false
        };

        $.getJSON("/schema-info/" + connectionId, params, function (data) {
            if (data.success) {
                $('#btn-reload-schema').show();

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
                            for (var i = 0; i < columns.length; i++) {
                                $('<li>' + columns[i].column_name + " <span class='data-type'>(" + columns[i].data_type + ')</span></li>').appendTo($tableNameUl);
                            }
                        }
                    }
                }
                var schemaInfo = $('.schema-info');
                schemaInfo.find('ul').find('ul').hide(); //find('ul').hide();
                schemaInfo.find('li').click(function (e) {
                    $(this).children('ul').toggle();
                    e.stopPropagation();
                });
            } else {
                $('<ul class="schema-info"><li>Problem getting Schema Info</li></ul>').appendTo('#panel-db-info');
            }
        });
    }
};