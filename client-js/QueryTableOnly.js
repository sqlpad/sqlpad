var React = require('react');
var QueryResultDataTable = require('./QueryResultDataTable.js');
import 'whatwg-fetch';
var Col = require('react-bootstrap/lib/Col');

var QueryEditor = React.createClass({
    getInitialState: function () {
        return {
            isSaving: false,
            isRunning: false,
            runQueryStartTime: undefined,
            queryResult: undefined
        }
    },
    runQuery: function (queryId) {
        this.setState({
            isRunning: true,
            runQueryStartTime: new Date()
        });
        fetch(baseUrl + '/api/query-result/' + queryId, {credentials: 'same-origin'})
            .then(function(response) {
                return response.json();
            }).then(function(json) {
                if (!json.success) {
                    console.log("problem running query");
                    console.log(json.error);
                }
                this.setState({
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
        this.runQuery(this.props.queryId);
    },
    render: function () {
        return (
            <QueryResultDataTable 
                {...this.props}
                isRunning={this.state.isRunning}
                runQueryStartTime={this.state.runQueryStartTime}
                queryResult={this.state.queryResult}
                queryError={this.state.queryError}
                querySuccess={this.state.querySuccess}
                />
        )    
    }
})

module.exports = QueryEditor;