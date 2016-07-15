var React = require('react');
var ReactDOM = require('react-dom');
import 'whatwg-fetch';

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


var ConfigValues = React.createClass({
    loadConfigValuesFromServer: function () {
        fetch(baseUrl + "/api/config-items", {credentials: 'same-origin'})
            .then(function(response) {
                return response.json()
            }).then(function(json) {
                this.setState({data: json});
            }.bind(this)).catch(function(ex) {
                console.log('parsing failed', ex)
                console.error(this.props.url, ex.toString());
            });
    },
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.loadConfigValuesFromServer();
    },
    render: function() {
        return (
            <div className="configBox">
                <h1>Configuration</h1>
                <hr />
                <ConfigForm data={this.state.data} />
                <h2>Environment Variables</h2>
                <hr />
                <ConfigEnvDocumentation data={this.state.data} />
            </div>
        );
    }
});
module.exports = ConfigValues;

var ConfigForm = React.createClass({
    render: function () {
        var configNodes = this.props.data.map(function(config) {
            if (config.interface === 'ui') {
                return (
                    <ConfigItem 
                        key={config.key}
                        configKey={config.key}
                        label={config.label}
                        description={config.description}
                        options={config.options}
                        default={config.default} 
                        value={config.value}>
                        {config.description}
                    </ConfigItem>
                );
            } 
        });
        return (
            <Form horizontal>
                {configNodes}
            </Form>
        );
    }
});

var ConfigItem = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value,
            isDirty: false,
            isSaving: false
        };
    },
    inputNode: function () {
        if (this.props.options) {
            var optionNodes = this.props.options.map(function (option) {
                return (
                    <option key={option} value={option}>{option.toString()}</option>
                )
            })
            return (
                <FormControl 
                    componentClass="select"
                    value={this.state.value} 
                    placeholder={this.props.label}
                    onChange={this.handleChange} >
                    {optionNodes}
                </FormControl>
            )
        } else {
            return (
                <FormControl 
                    type="text" 
                    value={this.state.value} 
                    placeholder={this.props.label} 
                    onChange={this.handleChange} />
            )
        }
    },
    handleClick: function (e) {
        this.setState({isSaving: true});
        var postData = {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: this.state.value
            })
        }
        fetch(baseUrl + '/api/config-values/' + this.props.configKey, postData)
            .then(function(response) {
                console.log('success: key: ' + this.props.configKey + '   value: ' + this.state.value);
                this.setState({isDirty: false, isSaving: false})
            }.bind(this)).catch(function(ex) {
                console.log('parsing failed', ex)
                this.setState({isSaving: false})
                console.error(this.props.url, ex.toString());
            });
    },
    handleChange: function (e) {
        this.setState({
            value: e.target.value,
            isDirty: true
        });  
    },
    render: function () {
        var defaultValue = (this.props.default === "" ? "<empty>" : this.props.default.toString())
        var buttonDisabled = (!this.state.isDirty);
        return (
            <FormGroup controlId="{this.props.configKey}">
                <Col sm={3}>
                    <ControlLabel>{this.props.label}</ControlLabel>
                </Col>
                <Col sm={3}>
                    <FormGroup>
                        <InputGroup>
                            {this.inputNode()}
                            <InputGroup.Button>
                                <Button disabled={buttonDisabled} onClick={this.handleClick}>
                                    {this.state.isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col sm={6}>
                    <HelpBlock>{this.props.description}</HelpBlock>
                    <HelpBlock>Default: {defaultValue}</HelpBlock>
                </Col>
            </FormGroup>
        );
    }
});



var ConfigEnvDocumentation = React.createClass({
    render: function () {
        var configNodes = this.props.data.map(function(config) {
            if (config.interface === 'env') {
                var defaultValue = (config.default === "" ? "<empty>" : config.default.toString())
                var currentValue = (config.value === "" ? "<empty>" : config.value.toString())
                var cliFlag = (config.cliFlag && config.cliFlag.pop ? config.cliFlag.pop() : config.cliFlag)
                if (cliFlag) cliFlag = "--" + cliFlag;
                return (
                    <FormGroup key={config.key} controlId="{this.props.configKey}">
                        <Col sm={3}>
                            <ControlLabel>{config.envVar}</ControlLabel>
                        </Col>
                        <Col sm={3}>
                            <FormControl 
                                type="text" 
                                value={currentValue} 
                                disabled
                                />
                        </Col>
                        <Col sm={6}>
                            <HelpBlock>
                                {config.description}
                            </HelpBlock>
                            <HelpBlock>
                                <strong>Default:</strong> {defaultValue}
                            </HelpBlock>
                            <HelpBlock>
                                <strong>CLI Flag:</strong> {cliFlag}
                            </HelpBlock>
                            <HelpBlock>
                                <strong>Set By:</strong> {config.setBy}
                            </HelpBlock>
                            
                        </Col>
                    </FormGroup>
                );
            } 
        });
        return (
            <Form horizontal>
                {configNodes}
            </Form>
        );
    }
});