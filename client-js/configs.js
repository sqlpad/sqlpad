var $ = require("jquery");

module.exports = function () {
    $('.form-delete-config').submit(function (event) {
        var confirmation = confirm("Delete this config item? This can't be undone.");
        if (confirmation) {
            return true;
        } else {
            event.preventDefault();
            return false;
        }
    });
};