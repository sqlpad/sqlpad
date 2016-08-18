var React = require('react');
var moment = require('moment');
var _ = require('_');
var uuid = require('uuid');
var keymaster = require('keymaster');
var Select = require('react-select');
var SchemaInfo = require('./SchemaInfo.js');
var QueryResultDataTable = require('./QueryResultDataTable.js');
var QueryResultHeader = require('./QueryResultHeader.js');
var ChartInputs = require('./ChartInputs.js');
var SqlpadTauChart = require('./SqlpadTauChart.js');


import 'whatwg-fetch';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/sql';
import 'brace/theme/github';


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
            }.bind(this))
            /*.catch(function(ex) {
                console.error(ex.toString());
            });
            */
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
    onChartTypeChange: function (e) {
        var chartType = e.target.value;
        var query = this.state.query;
        query.chartConfiguration.chartType = chartType;
        this.setState({query: query});
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
    onChartConfigurationFieldsChange: function (chartFieldId, queryResultField) {
        var query = this.state.query;
        query.chartConfiguration.fields[chartFieldId] = queryResultField;
        this.setState({
            query: query
        });
    },
    sqlpadTauChart: undefined,
    onVisualizeClick: function (e) {
        this.sqlpadTauChart.renderChart(true);
    },
    onTabSelect: function (tabkey) {
        var renderChartIfVisible = () => {
            var chartEl = document.getElementById('chart');
            if (chartEl.clientHeight > 0) {
                try {
                    this.sqlpadTauChart.renderChart();
                } 
                catch (e) {
                    console.log("tauchart rendering failed")
                    console.log(e);
                }
            } else {
                setTimeout(renderChartIfVisible, 20);
            }
        }
        renderChartIfVisible();
    },
    onSaveImageClick: function (e) {
        if (this.sqlpadTauChart && this.sqlpadTauChart.chart) {
            this.sqlpadTauChart.chart.fire('exportTo','png');    
        }
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
            <Tab.Container 
                id="left-tabs-example" 
                defaultActiveKey="sql"
                onSelect={this.onTabSelect}>
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
                                    <div className="sidebar">
                                        <FormGroup controlId="formControlsSelect" bsSize="small">
                                            <FormControl 
                                                value={this.state.query.chartConfiguration.chartType} 
                                                onChange={this.onChartTypeChange}
                                                componentClass="select" 
                                                className="input-small">
                                                <option value="">Choose a chart type...</option>
                                                <option value="line">Line</option>
                                                <option value="bar">Bar - Horizontal</option>
                                                <option value="verticalbar">Bar - Vertical</option>
                                                <option value="bubble">Scatterplot</option>
                                            </FormControl>
                                        </FormGroup>
                                        <hr/>
                                        <ChartInputs 
                                            chartType={this.state.query.chartConfiguration.chartType} 
                                            queryChartConfigurationFields={this.state.query.chartConfiguration.fields}
                                            onChartConfigurationFieldsChange={this.onChartConfigurationFieldsChange}
                                            queryResult={this.state.queryResult}
                                            />
                                        <hr/>
                                        <Button onClick={this.onVisualizeClick} className={'btn-block'} bsSize={'sm'}>Visualize</Button>
                                        <Button onClick={this.onSaveImageClick} className={'btn-block'} bsSize={'sm'}>
                                            <Glyphicon glyph="save" />{" "}
                                            Save Chart Image
                                        </Button>
                                    </div>
                                    <div className="NonSidebar">
                                        <SqlpadTauChart 
                                            query={this.state.query}
                                            queryResult={this.state.queryResult}
                                            ref={(ref) => this.sqlpadTauChart = ref} />
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Col>
            </Tab.Container>
        )    
    }
})

module.exports = QueryEditor;