var $ = require("jquery");

function renderFailure (text) {
    text = text || "Failed";
    $('#test-connection-result')
        .removeClass('label-info')
        .addClass('label-danger')
        .text(text);
}

function renderSuccess (text) {
    text = text || "Success";
    $('#test-connection-result')
        .removeClass('label-info')
        .addClass('label-success')
        .text(text);
}

function renderTesting () {
    $('#test-connection-result')
        .removeClass('label-danger')
        .removeClass('label-success')
        .addClass('label-info')
        .text('Testing...');
}

function handleDriverSpecificFields () {
    var driver = $('#driver').val();
    $('.driver-specific').hide();
    $('.driver-specific.' + driver).show();
}

module.exports = function () {
    $('#driver').change(handleDriverSpecificFields);
    handleDriverSpecificFields();
    
    $('#btn-test-connection').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var data = $('#connection-form').serialize();
        //console.log(data);
        renderTesting();
        $.ajax({
            type: "POST",
            url: baseUrl + "/connections/test",
            data: data
        }).done(function (data) {
            if (data.success) {
                renderSuccess();
            } else {
                renderFailure();
            }
        }).fail(function () {
            renderFailure("Something is broken.");
        });
    });
};
