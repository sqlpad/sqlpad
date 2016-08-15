var React = require('react');
var ReactDOM = require('react-dom');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
import CopyToClipboard from 'react-copy-to-clipboard';
import 'whatwg-fetch';


var SchemaInfo = React.createClass({
    getInitialState: function () {
        return {
            schemaInfo: {},
            loading: false
        }
    },
    componentDidMount: function () {
        if (this.props.connectionId) this.getSchemaInfo(this.props.connectionId);
    },
    componentWillReceiveProps: function (nextProps) {
        if (this.props.connectionId !== nextProps.connectionId) {
            this.getSchemaInfo(nextProps.connectionId);
        }
    },
    getSchemaInfo: function (connectionId, reload) { 
        if (connectionId) {
            this.setState({
                schemaInfo: {},
                loading: true
            });
            var url = baseUrl + "/api/schema-info/" + connectionId;
            if (reload) url = url + "?reload=true";
            fetch(url, {credentials: 'same-origin'})
                .then(function(response) {
                    // sometimes refreshes happen so fast and people don't get to enjoy the animation
                    setTimeout(() => {
                        this.setState({loading: false})
                    }, 1000);
                    return response.json()
                }.bind(this))
                .then(function(json) {
                    this.setState({
                        schemaInfo: json.schemaInfo
                    });
                }.bind(this))
                .catch(function(ex) {
                    console.error(ex.toString());
                });
        } else {
            this.setState({
                schemaInfo: {}
            });
        }
    },
    onConnectionChange: function (e) {
        var connectionId = e.target.value;
        this.props.onConnectionChange(connectionId);
        this.getSchemaInfo(connectionId);
    },
    onRefreshClick: function (e) {
        e.preventDefault();
        this.getSchemaInfo(this.props.connectionId, true);
    },
    render: function () {
        var connectionSelectOptions = this.props.connections.map(function (conn) {
            return (
                <option key={conn._id} value={conn._id}>{conn.name}</option>
            )
        });
        var refreshClass = (this.state.loading ? "spinning" : "");
        
        var schemaInfo = this.state.schemaInfo;
        var schemaCount = Object.keys(schemaInfo).length;
        var initShowTables = (schemaCount <= 2);
        var schemaItemNodes = Object.keys(schemaInfo).map((schema) => {
            return (
                <SchemaInfoSchemaItem {...this.props} initShowTables={initShowTables} key={schema} schema={schema} tables={schemaInfo[schema]} />
            )
        })

        return (
            <div className="sidebar">
                <FormGroup controlId="formControlsSelect" bsSize="small">
                    <FormControl value={this.props.connectionId} componentClass="select" onChange={this.onConnectionChange} className="input-small">
                        <option value="">Choose a connection...</option>
                        {connectionSelectOptions}
                    </FormControl>
                </FormGroup>
                <hr/>
                <div id="panel-db-info-container">
                    <a id="btn-reload-schema" href="#">
                        <Glyphicon glyph="refresh" className={refreshClass} onClick={this.onRefreshClick} />
                    </a>
                    <div id="panel-db-info">
                        <ul className="schema-info schema-info-table">
                            {schemaItemNodes}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
});


var SchemaInfoSchemaItem = React.createClass({
    getInitialState: function () {
        return {
            showTables: this.props.initShowTables
        };
    },
    onClick: function () {
        this.setState({
            showTables: !this.state.showTables
        });
    },
    render: function () {
        var tableJsx;
        if (this.state.showTables) {
            tableJsx = Object.keys(this.props.tables).map((table) => {
                return (
                    <SchemaInfoTableItem {...this.props} key={table} schema={this.props.schema} table={table} columns={this.props.tables[table]} />
                )
            })
        }
        return (
            <li key={this.props.schema}>
                <a href="#" onClick={this.onClick} className="schema-info-schema">{this.props.schema}</a>
                <ul>
                   {tableJsx}
                </ul>
            </li>
        )
    }
});

var SchemaInfoTableItem = React.createClass({
    getInitialState: function () {
        return {
            showColumns: false,
            showCopyButton: false,
            copyButtonText: 'copy'
        };
    },
    onClick: function () {
        this.setState({
            showColumns: !this.state.showColumns
        });
    },
    onMouseOver: function (e) {
        this.setState({
            showCopyButton: true
        });
    },
    onMouseOut: function (e) {
        this.setState({
            showCopyButton: false
        });
    },
    onCopyClick: function (e) {
        e.stopPropagation();
    },
    onCopy: function () {
        this.setState({copyButtonText: 'copied'});
        setTimeout(() => {
            this.setState({copyButtonText: 'copy'});
        }, 2000);
    },
    render: function () {
        var columnJsx;
        if (this.state.showColumns) {
            columnJsx = this.props.columns.map((column) => {
                return (
                    <SchemaInfoColumnItem 
                        {...this.props}
                        key={column.column_name}
                        schema={this.props.schema} 
                        table={this.props.table}
                        column_name={column.column_name}
                        data_type={column.data_type}/>
                )
            })
        }
        // this is hacky, but because of the way we're passing the schema info around
        // we need to reach down into the columns to get the type of this object
        var viewType = () => {
            var type = this.props.columns[0].table_type;
            if (type.toLowerCase().split('')[0] == 'v') return (<span className="data-type"> (view)</span>)
        }
        var copyButtonClassName = (this.state.showCopyButton ? 'copy-button label' : 'copy-button label hidden')
        var getCopyToClipboard = () => {
            if (this.props.config && this.props.config.showSchemaCopyButton) {
                return (
                    <CopyToClipboard text={this.props.schema + '.' + this.props.table}
                        onCopy={this.onCopy}>
                        <span id="path-tooltip" onClick={this.onCopyClick} className={copyButtonClassName}>{this.state.copyButtonText}</span>
                    </CopyToClipboard>
                )
            }
        }
        return (
            <li key={this.props.table}>
                <a href="#" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} onClick={this.onClick} className="schema-info-table">
                    {this.props.table} {viewType()}
                    {getCopyToClipboard()}
                </a>
                <ul>
                   {columnJsx}
                </ul>
            </li>
        )
    }
});

var SchemaInfoColumnItem = React.createClass({
    getInitialState: function () {
        return {
            showCopyButton: false,
            copyButtonText: 'copy'
        };
    },
    onMouseOver: function (e) {
        this.setState({
            showCopyButton: true
        });
    },
    onMouseOut: function (e) {
        this.setState({
            showCopyButton: false
        });
    },
    onCopyClick: function (e) {
        e.stopPropagation();
    },
    onCopy: function () {
        this.setState({copyButtonText: 'copied'});
        setTimeout(() => {
            this.setState({copyButtonText: 'copy'});
        }, 2000);
    },
    render: function () {
        var copyButtonClassName = (this.state.showCopyButton ? 'copy-button label label-info' : 'copy-button label label-info hidden')
        var getCopyToClipboard = () => {
            if (this.props.config && this.props.config.showSchemaCopyButton) {
                return (
                    <CopyToClipboard text={this.props.schema + '.' + this.props.table + '.' + this.props.column_name} onCopy={this.onCopy}>
                        <span id="path-tooltip" onClick={this.onCopyClick} className={copyButtonClassName}>{this.state.copyButtonText}</span>
                    </CopyToClipboard>
                )
            }
        }
        return (
            <li>
                <span onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className="schema-info-column">
                    {this.props.column_name} 
                    <span className="data-type"> ({this.props.data_type})</span>
                    {getCopyToClipboard()}
                </span>
            </li>
        )
    }
})


module.exports = SchemaInfo;