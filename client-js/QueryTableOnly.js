var React = require('react')
var fetchJson = require('./fetch-json.js')
var QueryResultDataTable = require('./QueryResultDataTable.js')

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
    })
    fetchJson('GET', this.props.config.baseUrl + '/api/query-result/' + queryId)
      .then((json) => {
        if (json.error) {
          console.error('problem running query')
          console.error(json.error)
        }
        this.setState({
          isRunning: false,
          queryError: json.error,
          queryResult: json.queryResult
        })
      })
      .catch((ex) => {
        console.error(ex.toString())
        this.setState({
          isRunning: false
        })
      })
  },
  componentDidMount: function () {
    this.runQuery(this.props.queryId)
  },
  render: function () {
    return (
      <QueryResultDataTable
        {...this.props}
        isRunning={this.state.isRunning}
        runQueryStartTime={this.state.runQueryStartTime}
        queryResult={this.state.queryResult}
        queryError={this.state.queryError}
        querySuccess={this.state.querySuccess} />
    )
  }
})

module.exports = QueryEditor
