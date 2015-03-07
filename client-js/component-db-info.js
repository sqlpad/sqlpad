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
        var jqxhr = $.get("/schema-info/" + connectionId, params);
        jqxhr.done(function (data) {
            $('#btn-reload-schema').show();
            $('#panel-db-info').html(data);
            var schemaInfo = $('.schema-info');
            schemaInfo.find('li').click(function (e) {
                $(this).children('ul').toggleClass('hidden');
                e.stopPropagation();
            });
        });
        jqxhr.fail(function () {
            $('<ul class="schema-info"><li>Problem getting Schema Info</li></ul>').appendTo('#panel-db-info');
        });
    }
};