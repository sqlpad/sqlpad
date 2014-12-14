var $ = require("jquery");

module.exports = function () {
    $('.form-delete-user').submit(function(event) {
        var confirmation = confirm("Delete this User? This can't be undone.");
        if (confirmation) {
            return true;
        } else {
            event.preventDefault();
            return false;
        }
    });
}