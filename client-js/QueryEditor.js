var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var _ = require('_');
var uuid = require('uuid');
var keymaster = require('keymaster');
var SchemaInfo = require('./SchemaInfo.js');
var Select = require('react-select');

import 'whatwg-fetch';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/sql';
import 'brace/theme/github';
import {Table, Column, Cell} from 'fixed-data-table'; // react's fixed data table


var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');
var Label = require('react-bootstrap/lib/Label');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Modal = require('react-bootstrap/lib/Modal');

var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;


var QueryDetailsModal = React.createClass({
    getInitialState: function () {
        return {
            showModal: false
        }
    },
    close: function () {
        this.setState({ showModal: false });
    },
    input: undefined,
    open: function () {
        this.setState({ showModal: true });
    },
    onSubmit: function (e) {
        e.preventDefault();
        this.close();
    },
    onQueryNameChange: function (e) {
        var newName = e.target.value;
        this.props.onQueryNameChange(newName);
        //document.title = newName;
    },
    onEntered: function () {
        if (this.input) this.input.focus();
    },
    render: function () {
        var myCategories = [
            {
                id: 'catid',
                type: 'tag',
                title: 'tags title',
                items: ['Array', 'With', 'Tags']
            }
        ]
        return (
                <Modal onEntered={this.onEntered} animation={true} show={this.state.showModal} onHide={this.close} >
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.onSubmit}>
                            <FormGroup>
                                <ControlLabel>Query Name</ControlLabel>
                                <input className="form-control" ref={(ref) => this.input = ref} type="text" value={this.props.queryName} onChange={this.onQueryNameChange} />
                            </FormGroup>
                            <br/>
                            <FormGroup>
                                <ControlLabel>Query Tags</ControlLabel>
                                <Select
                                    name="query-tags-field"
                                    value={this.props.tags}
                                    multi={true}
                                    allowCreate={true}
                                    placeholder=""
                                    options={this.props.tagOptions}
                                    onChange={this.props.onQueryTagsChange}
                                />
                            </FormGroup>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
        )   
    }
})


var QueryEditor = React.createClass({
    loadConnectionsFromServer: function () {
        fetch(baseUrl + "/api/connections/", {credentials: 'same-origin'})
            .then(function(response) {
                return response.json()
            }).then(function(json) {
                this.setState({
                    connections: json.connections
                });
                this.autoPickConnection();
            }.bind(this)).catch(function(ex) {
                console.error(ex.toString());
            });
    },
    loadQueryFromServer: function (queryId) {
        fetch(baseUrl + "/api/queries/" + queryId, {credentials: 'same-origin'})
            .then(function(response) {
                return response.json()
            }).then(function(json) {
                this.setState({
                    query: json.query
                });
            }.bind(this)).catch(function(ex) {
                console.error(ex.toString());
            });
    },
    autoPickConnection: function () {
        if (this.state.connections.length == 1 && this.state.query) {
            var stateQuery = this.state.query;
            stateQuery.connectionId = this.state.connections[0]._id;
            this.setState({
                query: stateQuery
            });
        }
    },
    getInitialState: function () {
        return {
            cacheKey: uuid.v1(),
            connections: [],
            isSaving: false,
            isRunning: false,
            isDirty: false,
            runQueryStartTime: undefined,
            queryResult: undefined,
            query: {
                _id: '',
                name: '',
                tags: [],
                connectionId: '',
                queryText: '',
                chartConfiguration: {
                    chartType: '',
                    fields: {} // key value for chart
                }
            }
        }
    },
    saveQuery: function () {
        var query = this.state.query;
        this.setState({isSaving: true});
        if (query._id) {
            var opts = {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            }
            fetch(baseUrl + '/api/queries/' + query._id, opts)
                .then(function(response) {
                    return response.json();
                }).then(function(json) {
                    setTimeout(() => {
                        this.setState({isSaving: false});
                    }, 500);
                    if (!json.success) {
                        console.log("problem saving query");
                        console.log(json.error);
                    }
                    this.setState({
                        query: json.query
                    });
                }.bind(this)).catch(function(ex) {
                    setTimeout(() => {
                        this.setState({isSaving: false});
                    }, 500);
                    console.log('parsing failed', ex);
                }.bind(this));
        } else {
            var opts = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            }
            fetch(baseUrl + '/api/queries', opts)
                .then(function(response) {
                    return response.json();
                }).then(function(json) {
                    setTimeout(() => {
                        this.setState({isSaving: false});
                    }, 500);
                    if (!json.success) {
                        console.log("problem saving query");
                        console.log(json.error);
                    } else {
                        window.history.replaceState({}, json.query.name, baseUrl + "/queries/" + json.query._id);
                    }
                    this.setState({
                        query: json.query
                    });
                }.bind(this)).catch(function(ex) {
                    setTimeout(() => {
                        this.setState({isSaving: false});
                    }, 500);
                    console.log('parsing failed', ex);
                }.bind(this));
        }
    },
    queryDetailsModal: undefined,
    openQueryDetailsModal: function () {
        this.queryDetailsModal.open();
    },
    onConnectionChange: function (connectionId) {
        var query = this.state.query;
        query.connectionId = connectionId;
        this.setState({
            query: query
        });
    },
    onQueryNameChange: function (name) {
        var query = this.state.query;
        query.name = name;
        this.setState({query: query});
    },
    onQueryTagsChange: function (values) {
        var query = this.state.query;
        query.tags = values.map(v => v.value);
        this.setState({query: query});
    },
    onQueryTextChange: function (queryText) {
        var query = this.state.query;
        query.queryText = queryText;
        this.setState({
            query: query
        });
    },
    runQuery: function () {
        var editor = this.editor;
        var selectedText = editor.session.getTextRange(editor.getSelectionRange());
        var queryToRun = selectedText || this.state.query.queryText;
        this.setState({
            isRunning: true,
            runQueryStartTime: new Date()
        });
        setTimeout(this.runningTimer, 60);
        var postData = {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                connectionId: this.state.query.connectionId,
                cacheKey: this.state.cacheKey,
                queryName: this.state.query.name,
                queryText: queryToRun
            })
        }
        fetch(baseUrl + '/api/run-query', postData)
            .then(function(response) {
                return response.json();
            }).then(function(json) {
                if (!json.success) {
                    console.log("problem running query");
                    console.log(json.error);
                }
                this.setState({
                    isDirty: false, 
                    isRunning: false,
                    querySuccess: json.success,
                    queryError: json.error,
                    queryResult: json.queryResult
                });
            }.bind(this)).catch(function(ex) {
                console.log('parsing failed', ex);
                this.setState({
                    isRunning: false
                });
            }.bind(this));
    },
    componentDidMount: function () {
        this.loadConnectionsFromServer();
        if (this.props.queryId != 'new') this.loadQueryFromServer(this.props.queryId);
        
        if (this.editor) this.editor.focus();

        /*  Shortcuts
        ==============================================================================*/
        // keymaster doesn't fire on input/textarea events by default
        // since we are only using command/ctrl shortcuts, 
        // we want the event to fire all the time for any element
        keymaster.filter = function (event) {
            return true; 
        };
        keymaster.unbind('ctrl+s, command+s');
        keymaster('ctrl+s, command+s', (e) => { 
            this.saveQuery();
            e.preventDefault();
            return false;
        });
        // there should only ever be 1 QueryEditor on the page, 
        // but just in case there isn't unbind anything previously bound
        // rather something previously not run than something run more than once
        keymaster.unbind('ctrl+r, command+r, ctrl+e, command+e');
        keymaster('ctrl+r, command+r, ctrl+e, command+e', (e) => { 
            this.runQuery();
            e.preventDefault();
            return false;
        });
    },
    render: function () {
        var tabsFormStyle = {
            position: 'absolute',
            left: "220px"
        }
        document.title = (this.state.query.name ? this.state.query.name : "New Query");
        var tagOptions = this.props.availableTags.map((t) => {
            return {value: t, label: t}
        });
        return (
            <Tab.Container id="left-tabs-example" defaultActiveKey="sql">
                <Col sm={12}>
                    <Row className="clearfix navbar-default">
                        <Nav bsStyle="tabs" className="navbar-left query-editor-nav-pills" style={{width: '100%', paddingLeft: 6}}>
                            <NavItem eventKey="sql">
                                <span className="glyphicon glyphicon-align-left"></span> SQL
                            </NavItem>
                            <NavItem eventKey="vis">
                                <span className="glyphicon glyphicon-stats"></span> Vis
                            </NavItem>
                        </Nav>
                        <Form inline className="navbar-form navbar-left navbar-left-border" style={tabsFormStyle}>
                            <Button className="QueryEditorSubheaderItem" 
                                onClick={this.saveQuery}
                                disabled={this.state.isSaving}>
                                <span className="shortcut-letter">S</span>{this.state.isSaving ? 'aving' : 'ave'}
                            </Button>
                            <Button className="QueryEditorSubheaderItem" onClick={this.runQuery}>
                                <span className="shortcut-letter">R</span>un
                            </Button>
                            <ControlLabel onClick={this.openQueryDetailsModal} className="QueryEditorSubheaderItem QueryEditorQueryName">{(this.state.query.name ? this.state.query.name : "(click to name query)")}</ControlLabel>
                            <QueryDetailsModal 
                                onQueryNameChange={this.onQueryNameChange} 
                                onQueryTagsChange={this.onQueryTagsChange}
                                queryName={this.state.query.name}
                                tags={this.state.query.tags}
                                tagOptions={tagOptions}
                                ref={(ref) => this.queryDetailsModal = ref }/>
                        </Form>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <Tab.Content animation={false}>
                                <Tab.Pane eventKey="sql">
                                    <div className="sidebar">
                                        <SchemaInfo
                                            {...this.props}
                                            connections={this.state.connections}
                                            connectionId={this.state.query.connectionId}
                                            onConnectionChange={this.onConnectionChange}
                                            />
                                    </div>
                                    <div className="NonSidebar">
                                        <div className="QueryEditorAceEditorWrapper">
                                            <AceEditor
                                                mode="sql"
                                                theme="github"
                                                name="query-ace-editor"
                                                width="100%"
                                                height="100%"
                                                showGutter={false}
                                                showPrintMargin={false}
                                                highlightActiveLine={false}
                                                onChange={this.onQueryTextChange}
                                                value={this.state.query.queryText}
                                                editorProps={{$blockScrolling: true}}
                                                ref={(ref) => this.editor = (ref ? ref.editor : null) }
                                                />
                                        </div>
                                        <div id="panel-result">
                                            <QueryResultHeader 
                                                {...this.props}
                                                isRunning={this.state.isRunning}
                                                cacheKey={this.state.cacheKey}
                                                runSeconds={this.state.runSeconds}
                                                queryResult={this.state.queryResult}
                                                />
                                            <QueryResultDataTable 
                                                {...this.props}
                                                cacheKey={this.state.cacheKey}
                                                isRunning={this.state.isRunning}
                                                runQueryStartTime={this.state.runQueryStartTime}
                                                queryResult={this.state.queryResult}
                                                queryError={this.state.queryError}
                                                querySuccess={this.state.querySuccess}
                                                />
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="vis">
                                    <h1>Vis</h1>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Col>
            </Tab.Container>
        )    
    }
})






var QueryResultHeader = React.createClass({
    render: function () {
        if (this.props.isRunning || !this.props.queryResult) {
            return (
                <div className="panel-result-header"></div>
            );
        }
        var csvDownloadLink = baseUrl + "/download-results/" + this.props.cacheKey + ".csv"
        var xlsxDownloadLink = baseUrl + "/download-results/" + this.props.cacheKey + ".xlsx"
        var serverSec = (this.props.queryResult ? (this.props.queryResult.queryRunTime / 1000) + ' sec.' : '' );
        var rowCount = (this.props.queryResult && this.props.queryResult.rows ? this.props.queryResult.rows.length : '');
        var downloadLinks = () => {
            if (this.props.config.allowCsvDownload) {
                return (
                    <span>
                        <span className="panel-result-header-label">Download: </span>
                        <a className="result-download-link" href={csvDownloadLink}>.csv</a>
                        <a className="result-download-link" href={xlsxDownloadLink}>.xlsx</a>
                    </span>
                );
            }
        }
        var incompleteNotification = () => {
            if (this.props.queryResult && this.props.queryResult.incomplete) {
                return (
                    <span className="panel-result-header-label incomplete-notification">Incomplete Data (hit record limit)</span>
                );
            }
        }
        return (
            <div className="panel-result-header">
                <span className="panel-result-header-item">
                    <span className="panel-result-header-label">Query Run Time: </span>
                    <span className="panel-result-header-value-DELETE">{serverSec}</span>
                </span>
                <span className="panel-result-header-item">
                    <span className="panel-result-header-label">Rows: </span>
                    <span className="panel-result-header-value-DELETE">{rowCount}</span>
                </span> 
                <span className="panel-result-header-item">
                    {downloadLinks()}    
                </span>   
                <span className="panel-result-header-item">
                    {incompleteNotification()}    
                </span>      
            </div>
        );
    }
});

module.exports = QueryEditor;




var SecondsTimer = React.createClass({
    _mounted: false,
    getInitialState: function () {
        return {
            runSeconds: 0
        }
    },
    timer: function () {
        if (this._mounted) {
            var now = new Date();
            this.setState({
                runSeconds: ((now - this.props.startTime)/1000).toFixed(3)
            });
            setTimeout(this.timer, 57);
        }
    },
    componentDidMount: function () {
        this._mounted = true;
        this.timer();
    },
    componentWillUnmount: function() {
        this._mounted = false;
    },
    render: function () {
        return (
            <span>{this.state.runSeconds}</span>
        )
    }
});



var QueryResultDataTable = React.createClass({
    getInitialState: function () {
        return {
            gridWidth: 0,
            gridHeight: 0
        }
    },
    handleResize: function(e) {
        var resultGrid = document.getElementById('panel-result');
        if (resultGrid) {
            this.setState({
                gridHeight: resultGrid.clientHeight,
                gridWidth: resultGrid.clientWidth
            });
        }
    },
    componentDidMount: function () {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
    },
    render: function () {
        if (this.props.isRunning) {
            return  (
                <div id="run-result-notification">
                    running...<br/>
                    <SecondsTimer startTime={this.props.runQueryStartTime} />
                </div>
            );
        } else if (!this.props.querySuccess && this.props.queryError) {
            return (
                <div id="run-result-notification" className="label-danger">
                    {this.props.queryError}
                </div>
            );
        } else if (this.props.queryResult && this.props.queryResult.rows) {
            var queryResult = this.props.queryResult;
            var columnNodes = queryResult.fields.map(function (field) {
                    
                var valueLength = queryResult.meta[field].maxValueLength;
                if (field.length > valueLength) valueLength = field.length;       
                var columnWidth = valueLength * 20;
                if (columnWidth < 200) columnWidth = 200;
                else if (columnWidth > 350) columnWidth = 350;
                var cellWidth = columnWidth - 10;

                var renderValue = (input) => {
                    if (queryResult.meta[field].datatype == 'date') {
                        return moment(input).format('MM/DD/YYYY HH:mm:ss');
                    } else {
                        return input;
                    }
                }

                return (
                    <Column
                        key={field}
                        header={<Cell>{field}</Cell>}
                        cell={({rowIndex}) => (
                            <Cell>
                                <div style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: cellWidth}}>
                                    {renderValue(queryResult.rows[rowIndex][field])}
                                </div>
                            </Cell>
                        )}
                        width={columnWidth}
                        />
                )
            })
            return (
                <div id="result-grid">
                    <Table
                        rowHeight={30}
                        rowsCount={queryResult.rows.length}
                        width={this.state.gridWidth}
                        height={this.state.gridHeight - 32}
                        headerHeight={30}>
                        {columnNodes}
                    </Table>
                </div>
            );
        } else {
            return null;
        }
    }
});



