var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
import 'whatwg-fetch';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/sql';
import 'brace/theme/github';

var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');
var Table = require('react-bootstrap/lib/Table');
var Label = require('react-bootstrap/lib/Label');

var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var Col = require('react-bootstrap/lib/Col');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var FormControl = require('react-bootstrap/lib/FormControl');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var HelpBlock = require('react-bootstrap/lib/HelpBlock');
var InputGroup = require('react-bootstrap/lib/InputGroup');
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

var _ = require('_');

var FilterableQueryList = React.createClass({
    getInitialState: function () {
        return {
            queries: [],
            connections: [],
            createdBys: [],
            tags: [],
            searchInput: null,
            selectedConnection: null,
            selectedTag: null,
            selectedCreatedBy: null,
            selectedSortBy: null,
            selectedQuery: null
        };
    },
    handleQueryListRowMouseOver: function (query) {
        this.setState({selectedQuery: query});
    },
    loadConfigValuesFromServer: function () {
        fetch(baseUrl + "/api/queries", {credentials: 'same-origin'})
            .then(function(response) {
                return response.json()
            }).then(function(json) {
                var createdBys = _.uniq(_.pluck(json.queries, 'createdBy'));
                var tags = _.compact(_.uniq(_.flatten(_.pluck(json.queries, 'tags'))));
                this.setState({
                    queries: json.queries,
                    createdBys: createdBys,
                    tags: tags
                });
            }.bind(this)).catch(function(ex) {
                console.error(ex.toString());
            });
        fetch(baseUrl + "/api/connections", {credentials: 'same-origin'})
            .then(function(response) {
                return response.json()
            }).then(function(json) {
                this.setState({connections: json.connections});
            }.bind(this)).catch(function(ex) {
                console.error(ex.toString());
            });
    },
    onSearchChange: function (searchInput) {
        this.setState({
            searchInput: searchInput,
            selectedQuery: null
        })
    },
    onConnectionChange: function (connectionId) {
        this.setState({
            selectedConnection: connectionId,
            selectedQuery: null
        });
    },
    onTagChange: function (tag) {
        this.setState({
            selectedTag: tag,
            selectedQuery: null
        });
    },
    onCreatedByChange: function (createdBy) {
        this.setState({
            selectedCreatedBy: createdBy,
            selectedQuery: null
        });
    },
    onSortByChange: function (sortBy) {
        this.setState({
            selectedSortBy: sortBy
        })
    },
    componentDidMount: function () {
        this.loadConfigValuesFromServer();
    },
    render: function () {
        var filteredQueries = this.state.queries.map((q) => q);
        if (this.state.selectedTag) {
            filteredQueries = filteredQueries.filter((q) => {
                return (q.tags && q.tags.length && q.tags.indexOf(this.state.selectedTag) > -1)
            });
        }
        if (this.state.selectedCreatedBy) {
            filteredQueries = filteredQueries.filter((q) => {
                return (q.createdBy == this.state.selectedCreatedBy)
            });
        }
        if (this.state.selectedConnection) {
            filteredQueries = filteredQueries.filter((q) => {
                return (q.connectionId == this.state.selectedConnection)
            });
        }
        if (this.state.searchInput) {
            var terms = this.state.searchInput.split(' ');
            var termCount = terms.length;
            filteredQueries = filteredQueries.filter((q) => {
                var matchedCount = 0;
                terms.forEach(function(term) {
                    term = term.toLowerCase();
                    if ((q.name && q.name.toLowerCase().search(term) != -1) || (q.queryText && q.queryText.toLowerCase().search(term) != -1)) matchedCount++; 
                });
                return (matchedCount == termCount);
            }); 
        }
        if (this.state.selectedSortBy == 'name') {
            filteredQueries = _.sortBy(filteredQueries, (query) => query.name.toLowerCase());
        } else {
            filteredQueries = _.sortBy(filteredQueries, 'modifiedDate').reverse();
        }
        
        return (
            <div>
                <QueryListSidebar 
                    connections={this.state.connections}
                    onConnectionChange={this.onConnectionChange}
                    tags={this.state.tags}
                    onSearchChange={this.onSearchChange}
                    onTagChange={this.onTagChange}
                    createdBys={this.state.createdBys}
                    onCreatedByChange={this.onCreatedByChange}
                    onSortByChange={this.onSortByChange}
                    />
                <QueryList 
                    queries={filteredQueries} 
                    selectedQuery={this.state.selectedQuery}
                    handleQueryListRowMouseOver={this.handleQueryListRowMouseOver}/>
                <QueryPreview 
                    selectedQuery={this.state.selectedQuery} />
            </div>
        )
    }
})


var QueryListSidebar = React.createClass({
    onSearchChange: function (e) {
        this.props.onSearchChange(e.target.value);
    },
    onConnectionChange: function (e) {
        this.props.onConnectionChange(e.target.value);
    },
    onTagChange: function (e) {
        this.props.onTagChange(e.target.value);
    },
    onCreatedByChange: function (e) {
        this.props.onCreatedByChange(e.target.value);
    },
    onSortByChange: function (e) {
        this.props.onSortByChange(e.target.value);
    },
    render: function () {
        var connectionSelectOptions = this.props.connections.map(function (conn) {
            return (
                <option key={conn._id} value={conn._id}>{conn.name}</option>
            )
        });
        var createdBySelectOptions = this.props.createdBys.map(function (createdBy) {
            return (
                <option key={createdBy} value={createdBy}>{createdBy}</option>
            )
        });
        var tagSelectOptions = this.props.tags.map(function (tag) {
            return (
                <option key={tag} value={tag}>{tag}</option>
            )
        })
        return (
            <div className="QueryListSidebar">
                <Form >
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Search</ControlLabel>
                        <FormControl type="text" onChange={this.onSearchChange}></FormControl>
                    </FormGroup>
                    <br/>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Tag</ControlLabel>
                        <FormControl componentClass="select" onChange={this.onTagChange}>
                            <option value="">All</option>
                            {tagSelectOptions}
                        </FormControl>
                    </FormGroup>
                    <br/>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Connection</ControlLabel>
                        <FormControl componentClass="select" onChange={this.onConnectionChange}>
                            <option value="">All</option>
                            {connectionSelectOptions}
                        </FormControl>
                    </FormGroup>
                    <br/>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Created By</ControlLabel>
                        <FormControl componentClass="select" onChange={this.onCreatedByChange}>
                            <option value="">All</option>
                            {createdBySelectOptions}
                        </FormControl>
                    </FormGroup>
                    <br/>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Sort By</ControlLabel>
                        <FormControl componentClass="select" onChange={this.onSortByChange}>
                            <option value="modifiedDate">Modified Date</option>
                            <option value="name">Name</option>
                        </FormControl>
                    </FormGroup>
                </Form>
            </div>
        )
    }
});


var QueryList = React.createClass({
    render: function () {
        var self = this;
        var QueryListRows = this.props.queries.map((query) => {
            return (
                <QueryListRow 
                    key={query._id} 
                    query={query} 
                    selectedQuery={this.props.selectedQuery}
                    handleQueryListRowMouseOver={self.props.handleQueryListRowMouseOver}/>
            )
        })
        return (
            <div className="QueryList">
                <ControlLabel>Queries</ControlLabel>
                <ListGroup className="QueryListContents">
                    {QueryListRows}
                </ListGroup>
            </div>
        )
    }
});

var QueryListRow = React.createClass({
    getInitialState: function () {
        return {
            showPreview: false
        }
    },
    onMouseOver: function (e) {
        this.props.handleQueryListRowMouseOver(this.props.query);
    },
    onClick: function (e) {
        //location.href=baseUrl + "/queries/" + this.props.query._id;
    },
    render: function () {
        var tagLabels = this.props.query.tags.map((tag) => {
            return (
                <Label bsStyle="info" key={tag} style={{marginLeft: 4}}>{tag}</Label> 
            )
        })
        var editUrl = baseUrl + "/queries/" + this.props.query._id;
        var tableUrl = baseUrl + "/query-table/" + this.props.query._id; 
        var chartUrl = baseUrl + "/query-chart/" + this.props.query._id; 
        var selectedStyle = () => {
            if (this.props.selectedQuery && this.props.selectedQuery._id == this.props.query._id) {
                return "list-group-item QueryListRow QueryListRowSelected"
            } else {
                return "list-group-item QueryListRow"
            }
        }
        return (
            <li
                onClick={this.onClick}
                className={selectedStyle()}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}>
                <h4><a href={editUrl}>{this.props.query.name}</a></h4>
                <p>{this.props.query.createdBy} {tagLabels}</p>
                <p><a href={tableUrl} target="_blank">table</a> <a href={chartUrl} target="_blank">chart</a> </p>
                <a className="QueryListRowDeleteButton" href="#"><Glyphicon glyph="trash" /></a>
            </li>
        );
    }
});

var QueryPreview = React.createClass({
    onChange: function (newValue) {
        
    },
    render: function () {
        if (this.props.selectedQuery) {
            var query = this.props.selectedQuery;
            var chartType = (query.chartConfiguration && query.chartConfiguration.chartType ? "chart type: " + query.chartConfiguration.chartType : "");
            return (
                <div className="QueryPreview">
                    <ControlLabel>Preview</ControlLabel>
                    <h4>{this.props.selectedQuery.name}</h4>
                    <AceEditor
                        mode="sql"
                        theme="github"
                        name="query-preview-ace-editor"
                        width="100%"
                        height="70%"
                        readOnly={true}
                        showGutter={false}
                        showPrintMargin={false}
                        highlightActiveLine={false}
                        onChange={this.onChange}
                        value={this.props.selectedQuery.queryText}
                        editorProps={{$blockScrolling: true}}
                        ref={(ref) => this.editor = (ref ? ref.editor : null) }
                    />
                    <h4>{chartType}</h4>
                    <h4>{"modified: " + moment(query.modifiedDate).calendar()}</h4>
                </div>
            )
        } else {
            return (
                <div className="QueryPreview">
                    
                </div>
            )
        }
            
    }
})



module.exports = FilterableQueryList;