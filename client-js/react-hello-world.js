var $ = require("jquery");
var React = require('react');
var ReactDOM = require('react-dom');

var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var Col = require('react-bootstrap/lib/Col');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var FormControl = require('react-bootstrap/lib/FormControl');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var HelpBlock = require('react-bootstrap/lib/HelpBlock');

const mountId = 'react-hello-world';
module.exports = function () {
    if (document.getElementById(mountId)) {
        ReactDOM.render(
            <ConfigBox />,
            document.getElementById(mountId)
        );
    }
}

var configs = [
    {
        key: "queryResultMaxRows",
        location: "ui",
        label: "Query Result Max Rows",
        description: "By default query results are limited to 50,000 records",
        defaultValue: "50000",
        value: "10000"
    },{
        key: "allowCsvDownload",
        location: "ui",
        label: "Allow CSV/XLSX Download",
        description: "Set to false to disable csv or xlsx downloads.",
        options: ["TRUE", "FALSE"],
        defaultValue: "TRUE",
        value: "FALSE"
    },{
        key: "slackWebhook",
        location: "ui",
        label: "Slack Webhook URL",
        description: "Supply incoming Slack webhook URL to post query when saved.",
        defaultValue: "",
        value: ""
    },{
        key: "showSchemaCopyButton",
        location: "ui",
        label: "Show Schema Copy Button",
        description: "Enable a button to copy an object's full schema path in schema explorer. Useful for databases that require fully qualified names.",
        options: ["TRUE", "FALSE"],
        defaultValue: "FALSE",
        value: ""        
    },{
        location: "env",
        key: "GOOGLE_CLIENT_ID",
        description: "Google Client ID used for OAuth setup",
        defaultValue: ""
    },{
        location: "env",
        key: "GOOGLE_CLIENT_SECRET",
        description: "Google Client Secret used for OAuth setup",
        defaultValue: ""
    },{
        location: "env",
        key: "PUBLIC_URL",
        description: "Public URL used for OAuth setup",
        defaultValue: ""
    },{
        location: "env",
        key: "DISABLE_USERPASS_AUTH",
        description: "Set to TRUE to disable built-in user authentication. Useful to restrict authentication to OAuth only.",
        defaultValue: ""
    }
]

var ConfigBox = React.createClass({
    getInitialState: function () {
        // executed once during setup
        return {data: configs};
    },
    componentDidMount: function () {
        // executed once after rendered
        // do ajax here or something
        this.setState({data: configs});
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

var ConfigForm = React.createClass({
    render: function () {
        var configNodes = this.props.data.map(function(config) {
            if (config.location === 'ui') {
                return (
                    <ConfigItem 
                        key={config.key}
                        configKey={config.key}
                        label={config.label}
                        description={config.description}
                        options={config.options}
                        defaultValue={config.defaultValue} 
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

var ConfigEnvDocumentation = React.createClass({
    render: function () {
        var configNodes = this.props.data.map(function(config) {
            if (config.location === 'env') {
                return (
                    <FormGroup key={config.key} controlId="{this.props.configKey}">
                        <Col sm={3}>
                            <ControlLabel>{config.key}</ControlLabel>
                        </Col>
                        <Col sm={6}>
                            <HelpBlock>Default: {(config.defaultValue ? config.defaultValue : "<empty>")}</HelpBlock>
                            <HelpBlock>{config.description}</HelpBlock>
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



var ConfigItem = React.createClass({
    inputNode: function () {
        if (this.props.options) {
            var optionNodes = this.props.options.map(function (option) {
                return (
                    <option key={option} value={option}>{option}</option>
                )
            })
            return (
                <FormControl 
                    componentClass="select"
                    value={(this.state.value ? this.state.value : this.props.defaultValue)} 
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
    getInitialState: function () {
        return {
            value: this.props.value
        };
    },
    handleChange: function (e) {
        this.setState({value: e.target.value});
    },
    render: function () {
        return (
            <FormGroup controlId="{this.props.configKey}">
                <Col sm={3}>
                    <ControlLabel>{this.props.label}</ControlLabel>
                </Col>
                <Col sm={3}>
                    {this.inputNode()}
                </Col>
                <Col sm={6}>
                    <HelpBlock>Default: {(this.props.defaultValue ? this.props.defaultValue : "<empty>")}</HelpBlock>
                    <HelpBlock>{this.props.description}</HelpBlock>
                </Col>
            </FormGroup>
        );
    }
});
