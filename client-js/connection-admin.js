var $ = require("jquery");

module.exports = function () {
    $('.form-delete-connection').submit(function(event) {
        var confirmation = confirm("Delete this Connection? This can't be undone.");
        if (confirmation) {
            return true;
        } else {
            event.preventDefault();
            return false;
        }
    });
}