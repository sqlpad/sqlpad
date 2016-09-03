var React = require('react');
var fetchJson = require('./fetch-json.js');
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
        fetchJson('GET', baseUrl + "/api/queries/" + queryId)
            .then((json) => {
                if (json.error) console.error(json.error);
                this.setState({
                    query: json.query
                });
            })
            .then(() => {
                return fetchJson('GET', baseUrl + '/api/query-result/' + queryId)        
            })
            .then((json) => {
                if (json.error) console.error(json.error);
                this.setState({
                    isRunning: false,
                    queryError: json.error,
                    queryResult: json.queryResult
                });
            })
            .catch((ex) => {
                console.error(ex.toString());
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
                queryError={this.state.queryError}
                isRunning={this.state.isRunning}
                />
        )    
    }
})

module.exports = QueryEditor;