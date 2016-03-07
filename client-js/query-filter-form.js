var $ = require("jquery");

module.exports = function () {
    var $queryFilterForm = $('#query-filter-form');
    if ($queryFilterForm.length) {
        $('select').change(function () {
            //console.log($queryFilterForm.serialize());
            $.get(baseUrl + '/queries?' + $queryFilterForm.serialize(), function (data) {
                $('#queries-table').empty().html(data);
            });
            //window.location.href = '/queries?' + $queryFilterForm.serialize();
        });
        $('#query-filter-search').keyup(function() {
            $.get(baseUrl + '/queries?' + $queryFilterForm.serialize(), function (data) {
                $('#queries-table').empty().html(data);
            });
        });
    }
    
    $('.form-delete-query').submit(function(event) {
        var confirmation = confirm("Delete the query? This can't be undone.");
        if (confirmation) {
            return true;
        } else {
            event.preventDefault();
            return false;
        }
    });
}
