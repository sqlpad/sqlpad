/*

 "component" for db schema info

 EXAMPLE:

 var DbInfo = require('this-file.js');
 var dbInfo = new DbInfo();
 dbInfo.getConnectionId();



 */

var $ = require('jquery');
var ZeroClipboard = require('ZeroClipboard');
ZeroClipboard.config({ bubbleEvents: false });

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
        var jqxhr = $.get(baseUrl + "/schema-info/" + connectionId, params);
        jqxhr.done(function (data) {
            $('#btn-reload-schema').show();
            $('#panel-db-info').html(data);
            var schemaInfo = $('.schema-info');
            schemaInfo.find('li').click(function (e) {
                e.stopPropagation();
                $(this).children('ul').toggleClass('hidden');
            });
            
            // table/column copy button
            // Vertica needs fully qualified names, and sometimes these are quite long
            // This adds a copy button on hover. Someday maybe we can have autocomplete
            var $copyBtn = $('<a id="path-tooltip" href="#" class="copy-button tag label label-info">copy</a>');
            if (schemaInfo.hasClass("show-schema-copy-button")) {
                schemaInfo.find('.schema-info-table, .schema-info-column').each(function () {
                    var zeroClient;
                    var $schemaItem = $(this);
                    var created = false;
                    
                    function hoverOn (e) {
                        e.stopPropagation();
                        if (created && ( $(e.target).hasClass('schema-info-table') || $(e.target).hasClass('schema-info-column') ) ) {
                            zeroClient.destroy();
                            $copyBtn.detach();
                            created = false;
                        }
                        if ($(e.target).hasClass('schema-info-table') || $(e.target).hasClass('schema-info-column') ) {
                            $schemaItem.append($copyBtn);
                            var fullName = $schemaItem.attr('data-full-name');
                            $copyBtn.attr("data-clipboard-text", fullName);
                            zeroClient = new ZeroClipboard( $copyBtn.get(0) );
                            created = true;
                        }
                    }
                    
                    function hoverOff (e) {
                        if (created && ( $(e.target).hasClass('schema-info-table') || $(e.target).hasClass('schema-info-column') ) ) {
                            zeroClient.destroy();
                            $copyBtn.detach();
                            created = false;
                        }
                    }
                    
                    $(this).hover(hoverOn, hoverOff);
                });
            }
            
        });
        jqxhr.fail(function () {
            $('<ul class="schema-info"><li>Problem getting Schema Info</li></ul>').appendTo('#panel-db-info');
        });
    }
};
