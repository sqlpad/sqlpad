// The last javascript file. 
// It'll contain all the old-school jQuery stuff.

/* 
    From connection.ejs, its the button to test the database connection!
    with the power of AJAX, we can find out that a connection doesn't work 
    BEFORE trying to use it. REVOLUTIONARY.
============================================================================= */
$('#btn-test-connection').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    var data = $('#connection-form').serialize();
    console.log(data);
    $('#test-connection-result')
        .removeClass('label-danger')
        .removeClass('label-success')
        .addClass('label-info')
        .text('Testing...');
    $.ajax({
        type: "POST",
        url: "/connections/test",
        data: data
    }).done(function (data) {
        if (data.success) {
            $('#test-connection-result')
                .removeClass('label-info')
                .addClass('label-success')
                .text('Success');
        } else {
            $('#test-connection-result')
                .removeClass('label-info')
                .addClass('label-danger')
                .text('Failed');
        }
    }).fail(function () {
        
    });
});



/* 
    From query.ejs, its the ace editor!
============================================================================= */
var editor = ace.edit("ace-editor");
if (editor) { 
    //editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/sql");    
    editor.focus();
    editor.commands.addCommand({
        name: 'saveQuery',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function (editor) {
            saveQuery(null, editor);
        }
    });
    editor.commands.addCommand({
        name: 'executeQuery',
        bindKey: {win: 'Ctrl-E',  mac: 'Command-E'},
        exec: function (editor) {
            runQuery(null, editor);
        }
    });
    editor.commands.addCommand({
        name: 'runQuery',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function (editor) {
            runQuery(null, editor);
        }
    });
}

function getEditorText (editor) {
    var relevantText;
    var selectedText = editor.session.getTextRange(editor.getSelectionRange());
    if (selectedText.length) {
        // get only selected content
        relevantText = selectedText;
    } else {
        // get whole editor content
        relevantText = editor.getValue();
    }
    return relevantText;
};

$('#btn-save').click(function (event) {
    saveQuery(event, editor);
});

$('#btn-run-query').click(function (event) {
    runQuery(event, editor);
})




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
function saveQuery (event, editor) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    $('#query-details-modal').modal('hide')
    
    var queryId = $('#query-id').val();
    var query = {
        name: $('#name').val(),
        queryText: getEditorText(editor),
        tags: $.map($('#tags').val().split(','), $.trim),
        connectionId: $('#connection').val()
    };
    console.log(query);
    $('#btn-save-result').text('saving...').show();
    $.ajax({
        type: "POST",
        url: "/queries/" + queryId,
        data: query
    }).done(function (data) {
        if (data.success) {
            //alert('success');
            window.history.replaceState({}, "query " + data.query._id, "/queries/" + data.query._id)
            $('#btn-save-result').removeClass('label-info').addClass('label-success').text('Success');
            setTimeout(function () {
                $('#btn-save-result').fadeOut(400, function () {
                    $('#btn-save-result').removeClass('label-success').addClass('label-info').text('');
                })
            }, 1000);
        } else {
            //alert('fail on the server side idk');
            $('#btn-save-result').removeClass('label-info').addClass('label-danger').text('Failed');
        }
    }).fail(function () {
        alert('ajax fail')
    });
};


var grid;
var clientStart;
var clientEnd;

function runQuery (event, editor) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    // TODO: destroy/empty a slickgrid. for now we'll just empty
    $('#result-slick-grid').empty();
    
    var data = {
        queryText: getEditorText(editor),
        connectionId: $('#connection').val()
    };
    notifyRunning();
    clientStart = new Date();
    $.ajax({
        type: "POST",
        url: "/run-query",
        data: data
    }).done(renderQueryResult).fail(notifyFailure);
}

function notifyRunning () {
    $('#btn-run-result').text('running...').show();
}

function notifyFailure () {
    alert('ajax fail');
}

function renderQueryResult (data) {
    clientEnd = new Date();
    $('#client-run-time').html((clientEnd - clientStart)/1000 + " sec.");
    $('#server-run-time').html(data.serverMs/1000 + " sec.")
    if (data.success) {
        
        var columns = [];
        if (data.results && data.results[0]) {
            $('#rowcount').html(data.results.length);
            var firstRow = data.results[0];
            for (var col in firstRow) {
                columns.push({id: col, name: col, field: col, width: col.length * 15});
            }
        }
        var options = {
          enableCellNavigation: true,
          enableColumnReorder: false
        };
        grid = new Slick.Grid("#result-slick-grid", data.results, columns, options);
        
        $('#btn-run-result')
            .removeClass('label-info')
            .addClass('label-success')
            .text('Success');
        setTimeout(function () {
            $('#btn-run-result').fadeOut(400, function () {
                $('#btn-run-result')
                    .removeClass('label-success')
                    .removeClass('label-danger')
                    .addClass('label-info')
                    .text('');
            })
        }, 1000);
    } else {
        $('#btn-run-result')
            .removeClass('label-info')
            .addClass('label-danger')
            .text('Failed');
    }
}

function getDbInfo () {
    $('#panel-db-info').empty();
    var connectionId = $('#connection').val();
    $.getJSON("/schema-info/" + connectionId, function (tree) {
        var $root = $('<ul class="schema-info">').appendTo('#panel-db-info');
        for (var tableType in tree) {
            var $tableType = $('<li><a href="#">' + tableType + '</a></li>').appendTo($root);
            var $tableTypeUl = $('<ul>').appendTo($tableType);
            for (var schema in tree[tableType]) {
                var $schema = $('<li><a href="#">' + schema + '</a></li>').appendTo($tableTypeUl);
                var $schemaUl = $('<ul>').appendTo($schema);
                for (var tableName in tree[tableType][schema]) {
                    var $tableName = $('<li><a href="#">' + tableName + '</a></li>').appendTo($schemaUl);
                    var $tableNameUl = $('<ul>').appendTo($tableName);
                    var columns = tree[tableType][schema][tableName];
                    for (var i=0; i < columns.length; i++) {
                        $column = $('<li>' + columns[i].column_name + '</li>').appendTo($tableNameUl);
                    }
                }
            }
        }
        $('.schema-info').find('ul').find('ul').hide();
        $('.schema-info').find('li').click(function (e) {
            $(this).children('ul').toggle();
            e.stopPropagation();
        });
    });
};

getDbInfo();

$('#panel-main').split({orientation: 'vertical', limit: 50, position: '200px', onDragEnd: resizeStuff});
$('#panel-editor-viz-results').split({orientation: 'horizontal', limit: 50, onDragEnd: resizeStuff});
$('#editor-viz-panels').split({orientation: 'vertical', limit: 50, onDragEnd: resizeStuff});

function resizeStuff () {
    editor.resize();
    //https://github.com/mleibman/SlickGrid/wiki/Slick.Grid#resizeCanvas
    if (grid) grid.resizeCanvas();
}

