var React = require('react')
var SecondsTimer = require('./SecondsTimer.js')
var moment = require('moment')
import {Table, Column, Cell} from 'fixed-data-table' // react's fixed data table
var _ = require('_')

var QueryResultDataTable = React.createClass({
  getInitialState: function () {
    return {
      gridWidth: 0,
      gridHeight: 0
    }
  },
  handleResize: function (e) {
    var resultGrid = document.getElementById('result-grid')
    if (resultGrid) {
      this.setState({
        gridHeight: resultGrid.clientHeight,
        gridWidth: resultGrid.clientWidth
      })
    }
  },
  componentDidMount: function () {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  componentWillUnmount: function () {
    window.removeEventListener('resize', this.handleResize)
  },
  render: function () {
    if (this.props.isRunning) {
      return (
        <div id='result-grid' className='run-result-notification'>
          running...<br />
          <SecondsTimer startTime={this.props.runQueryStartTime} />
        </div>
      )
    } else if (this.props.queryError) {
      return (
        <div id='result-grid' className='run-result-notification label-danger'>
          {this.props.queryError}
        </div>
      )
    } else if (this.props.queryResult && this.props.queryResult.rows) {
      var queryResult = this.props.queryResult
      var columnNodes = queryResult.fields.map(function (field) {
        var fieldMeta = queryResult.meta[field]
        var valueLength = fieldMeta.maxValueLength

        if (field.length > valueLength) valueLength = field.length
        var columnWidth = valueLength * 20
        if (columnWidth < 200) columnWidth = 200
        else if (columnWidth > 350) columnWidth = 350
        var cellWidth = columnWidth - 10

        var renderValue = (input) => {
          if (fieldMeta.datatype === 'date') {
            return moment(input).format('MM/DD/YYYY HH:mm:ss')
          } else if (_.isObject(input)) {
            return JSON.stringify(input, null, 2)
          } else {
            return input
          }
        }

        return (
          <Column
            key={field}
            header={<Cell>{field}</Cell>}
            cell={({rowIndex}) => {
              var value = queryResult.rows[rowIndex][field]
              var barStyle
              var numberBar
              if (fieldMeta.datatype === 'number') {
                value = Number(value)
                var range = fieldMeta.max - (fieldMeta.min < 0 ? fieldMeta.min : 0)
                var left = 0
                if (fieldMeta.min < 0 && value < 0) {
                  left = Math.abs(fieldMeta.min - value) / range * 100 + '%'
                } else if (fieldMeta.min < 0 && value >= 0) {
                  left = Math.abs(fieldMeta.min) / range * 100 + '%'
                }
                barStyle = {
                  position: 'absolute',
                  left: left,
                  top: 0,
                  bottom: 0,
                  width: (Math.abs(value) / range) * 100 + '%',
                  backgroundColor: '#ffcf78'
                }
                numberBar = <div style={barStyle} />
              }
              return (
                <Cell>
                  {numberBar}
                  <div style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: cellWidth, position: 'absolute'}}>
                    {renderValue(value)}
                  </div>
                </Cell>
              )
            }}
            width={columnWidth}
          />
        )
      })
      return (
        <div id='result-grid'>
          <Table
            rowHeight={30}
            rowsCount={queryResult.rows.length}
            width={this.state.gridWidth}
            height={this.state.gridHeight}
            headerHeight={30}>
              {columnNodes}
          </Table>
        </div>
      )
    } else {
      return <div id='result-grid' />
    }
  }
})

module.exports = QueryResultDataTable
