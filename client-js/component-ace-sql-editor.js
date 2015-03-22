var $ = require('jquery');
var ace = require('ace');

module.exports = function (id) {
    var me = this;
    
    id = id || "ace-editor";
    var editor = ace.edit(id);
    
    if (editor) { 
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/sql");    
        editor.focus();
    }
    
    this.addCommand = function (aceCommand) {
        editor.commands.addCommand(aceCommand);
    };
    
    this.getEditorText = function () {
        return editor.getValue();
    };
    
    this.getSelectedOrAllText = function () {
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
    
    this.resize = function () {
        editor.resize();
    };
    
    $(window).resize(me.resize);
};