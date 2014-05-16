// some of this code I wrote but didn't end up using. 
// gonna list it here in case I want to revisit it...

// Ace Editor shortcuts to switch bootstrap tabs. 
editor.commands.addCommand({
    name: 'nextTab',
    bindKey: {win: 'Ctrl-]', mac: 'Command-]'},
    exec: function (editor) {
        $('.panel-tab-bar li.active').next().find('a').tab('show');
    }
});
editor.commands.addCommand({
    name: 'previousTab',
    bindKey: {win: 'Ctrl-[', mac: 'Command-['},
    exec: function (editor) {
        $('.panel-tab-bar li.active').prev().find('a').tab('show');
    }
});