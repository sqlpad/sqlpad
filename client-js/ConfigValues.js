var React = require('react');
var fetchJson = require('./fetch-json.js');
var Alert = require('react-s-alert').default;

var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var Col = require('react-bootstrap/lib/Col');
var Row = require('react-bootstrap/lib/Row');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var FormControl = require('react-bootstrap/lib/FormControl');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var HelpBlock = require('react-bootstrap/lib/HelpBlock');
var InputGroup = require('react-bootstrap/lib/InputGroup');
var Button = require('react-bootstrap/lib/Button');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');


var ConfigValues = React.createClass({
    loadConfigValuesFromServer: function () {
        fetchJson('GET', this.props.config.baseUrl + "/api/config-items")
            .then((json) => {
                this.setState({configItems: json.configItems});
            })
    },
    saveConfigValue: function (key, value) {
        fetchJson('POST', this.props.config.baseUrl + '/api/config-values/' + key, {value: value})
            .then((json) => {
                if (json.error) {
                    Alert.error('Save failed');
                } else {
                    Alert.success('Value saved');
                }
            })
    },
    getInitialState: function () {
        return {configItems: []};
    },
    componentDidMount: function () {
        this.loadConfigValuesFromServer();
        this.saveConfigValue = _.debounce(this.saveConfigValue, 500);
    },
    render: function() {
        var configItemInputNodes = this.state.configItems.map((config) => {
            if (config.interface === 'ui') {
                return (
                    <ConfigItemInput 
                        key={config.key}
                        configKey={config.key}
                        label={config.label}
                        description={config.description}
                        options={config.options}
                        default={config.default} 
                        value={config.effectiveValue}
                        saveConfigValue={this.saveConfigValue}
                        />
                );
            } 
        });
        return (
            <Col sm={6} smOffset={2}>
                <div className="configBox">
                    <h1 style={{textAlign: 'center'}}>Configuration</h1>
                    <hr />
                    <Form horizontal>
                        {configItemInputNodes}
                    </Form>
                    <h2 style={{textAlign: 'center', marginTop: 50}}>Environment Variables</h2>
                    <hr />
                    <p>
                        Some configuration is only accessible via environment variables
                        or command-line-interface (CLI) flags. Below are the current values for these 
                        variables. Sensitive values are masked. Hover over input for additional information.
                    </p>
                    <hr />
                    <ConfigEnvDocumentation configItems={this.state.configItems} />
                </div>
                <Alert stack={{limit: 3}} position='bottom-right' />
            </Col>
        );
    }
});
module.exports = ConfigValues;



var ConfigItemInput = React.createClass({
    getInitialState: function () {
        return {
            value: this.props.value
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
                    onChange={this.handleChange}
                    >
                    {optionNodes}
                </FormControl>
            )
        } else {
            return (
                <FormControl 
                    type="text" 
                    value={this.state.value} 
                    placeholder={this.props.label} 
                    onChange={this.handleChange}
                    />
            )
        }
    },
    handleChange: function (e) {
        this.setState({
            value: e.target.value
        });  
        this.props.saveConfigValue(this.props.configKey, e.target.value);
    },
    render: function () {
        var defaultValue = () => {
            if (this.props.default === "") return (
                <em style={{color: '#999'}}>empty</em>
            ) 
            return (
                <span>{this.props.default.toString()}</span>
            ) 
        } 
        var helpPopover = (
            <Popover id="popover-trigger-focus" title={this.props.label}>
                <HelpBlock>{this.props.description}</HelpBlock>
                <HelpBlock>Default: {defaultValue()}</HelpBlock>
            </Popover>
        );
        return (
            <FormGroup controlId={this.props.configKey}>
                <Col componentClass={ControlLabel} sm={6}>
                    {this.props.label}
                </Col>
                <Col sm={6}>
                    <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={helpPopover}>
                        {this.inputNode()}    
                    </OverlayTrigger>
                </Col>
            </FormGroup>
        );
    }
});



var ConfigEnvDocumentation = React.createClass({
    render: function () {
        var configNodes = this.props.configItems.map(function(config) {
            if (config.interface === 'env') {
                var defaultValue = () => {
                    if (config.default === "") return (
                        <em style={{color: '#999'}}>empty</em>
                    ) 
                    return (
                        <span>{config.default.toString()}</span>
                    ) 
                } 
                var currentValue = (config.value === "" ? "<empty>" : config.effectiveValue.toString())
                var cliFlag = (config.cliFlag && config.cliFlag.pop ? config.cliFlag.pop() : config.cliFlag)
                if (cliFlag) cliFlag = "--" + cliFlag;
                var helpPopover = (
                    <Popover id="popover-trigger-focus" title={config.envVar}>
                        <HelpBlock>
                            <p>
                                {config.description}
                            </p>
                            <p>
                                <strong>Default:</strong> {defaultValue()}
                            </p>
                            <p>
                                <strong>CLI Flag:</strong> {cliFlag}
                            </p>
                            <p>
                                <strong>Set By:</strong> {config.effectiveValueSource}
                            </p>
                        </HelpBlock>
                    </Popover>
                );
                return (
                    <Row key={config.key} style={{marginTop: 30}}>
                        <Col componentClass={ControlLabel} sm={6}>
                            {config.envVar}
                        </Col>
                        <Col sm={6}>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={helpPopover}>
                                <FormControl 
                                    type="text" 
                                    value={currentValue} 
                                    disabled
                                    />
                            </OverlayTrigger>
                        </Col>
                    </Row>
                );
            } 
        });
        return (
            <Form horizontal style={{marginBottom: 50}}>
                {configNodes}
            </Form>
        );
    }
});