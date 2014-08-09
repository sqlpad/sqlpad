/*

"component" for menubar

EXAMPLE: 

var Menubar = require('this-file.js');
var menubar = new Menubar();





*/

var $ = require('jquery');

var Menubar = function (opts) {
    var me = this;
    var dbInfo = opts.dbInfo;
    var sqlEditor = opts.sqlEditor;
    var chartEditor = opts.chartEditor;
    
    $('#btn-save').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        me.saveQuery();
    });
    
    $('#btn-run-query').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        sqlEditor.runQuery();
    });
    
    this.saveQuery = function () {
         /*
             should POST to /queries/:id or /queries/new
             {
                 name: 'a fun query',
                 tags: [],
                 connectionId: connectionId
             }
             
             it returns
             {
                 success: true,
                 query: queryobject
             }
         */
         var $queryId = $('#query-id');
         var query = {
             name: $('#header-query-name').val(),
             queryText: sqlEditor.getEditorText(),
             tags: $.map($('#tags').val().split(','), $.trim),
             connectionId: dbInfo.getConnectionId(),
             chartConfiguration: chartEditor.getChartConfiguration()
         };
         console.log("saving query:");
         console.log(query);
         $('#btn-save-result').text('saving...').show();
         $.ajax({
             type: "POST",
             url: "/queries/" + $queryId.val(),
             data: query
         }).done(function (data) {
             if (data.success) {
                 window.history.replaceState({}, "query " + data.query._id, "/queries/" + data.query._id);
                 $queryId.val(data.query._id);
                 $('#btn-save-result').removeClass('label-info').addClass('label-success').text('Success');
                 setTimeout(function () {
                     $('#btn-save-result').fadeOut(400, function () {
                         $('#btn-save-result').removeClass('label-success').addClass('label-info').text('');
                     });
                 }, 1000);
             } else {
                 $('#btn-save-result').removeClass('label-info').addClass('label-danger').text('Failed');
             }
         }).fail(function () {
             alert('ajax fail');
         });
     };
    
};

module.exports = Menubar;