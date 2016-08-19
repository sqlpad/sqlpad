var React = require('react');
import 'whatwg-fetch';
var SqlpadTauChart = require('./SqlpadTauChart.js');

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
        fetch(baseUrl + "/api/queries/" + queryId, {credentials: 'same-origin'})
            .then((response) => {
                return response.json()
            }).then((json) => {
                this.setState({
                    query: json.query
                });
            })
            .then(() => {
                return fetch(baseUrl + '/api/query-result/' + queryId, {credentials: 'same-origin'})        
            })
            .then((response) => {
                return response.json();
            }).then((json) => {
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
            }).catch((ex) => {
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
            <SqlpadTauChart 
                query={this.state.query}
                queryResult={this.state.queryResult}
                isRunning={this.state.isRunning}
                />
        )    
    }
})

module.exports = QueryEditor;