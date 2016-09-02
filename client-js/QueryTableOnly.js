var React = require('react');
var fetchJson = require('./fetch-json.js');
var QueryResultDataTable = require('./QueryResultDataTable.js');
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
        fetchJson('GET', baseUrl + '/api/query-result/' + queryId)
            .then((json) => {
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
            })
            .catch((ex) => {
                console.log('parsing failed', ex);
                this.setState({
                    isRunning: false
                });
            });
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