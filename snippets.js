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

/*
Sidebar Navigation HTML. Just got way too cluttered.

<div class="schema-info">
    <ul>
        <li class="sidebar-header">Navigation</li>
        <li><a href="/queries">Queries</a></li>
        <% if (session && session.admin) { %>
        <li><a href="/connections">Connections</a></li>
        <li><a href="/users">Users</a></li>
        <% } %>
    </ul>
    
    <ul>
        <li class="sidebar-header">Actions</li>
        <li><a href="#">New Query</a></li>
        <li><a href="#">Save</a></li>
        <li><a href="#">Clone</a></li>
        <li><a href="#" data-toggle="modal" data-target="#query-details-modal">Edit Query Details</a></li>
    </ul>
    
    <ul>
        <li class="sidebar-header">Query Name</li>
        <li contenteditable="true"><%= query.name || '' %></li>
        <li class="sidebar-header">Tags</li>
        <li contenteditable="true"><%= query.tags || '' %></li>
        <li class="sidebar-header">Connection</li>
        <li>
            <% if (navbarConnections && navbarConnections.length) { %>
            <div class="form-group">
                <select id="connection" name="connection" class="form-control input-sm">
                    <option value="">Choose a Connection...</option>
                    <% navbarConnections.forEach(function(connection) { %>
                        <option value="<%= connection._id %>" <%=( connection._id===query.connectionId ? 'selected' : '') %>>
                            <%= connection.name %>
                        </option>
                    <% }) %>
                </select>
            </div>
            <% } %>
        </li>
        <li><button class="btn btn-default btn-sm">Run Query</button></li>
    </ul>
</div>
<hr>

*/