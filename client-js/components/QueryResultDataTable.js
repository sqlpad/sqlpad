import React from 'react'
import {Table, Column, Cell} from 'fixed-data-table'
import SpinKitCube from './SpinKitCube.js'
import moment from 'moment'
const _ = window._

const renderValue = (input, fieldMeta) => {
  if (input === null || input === undefined) {
    return <em>null</em>
  } else if (input === true || input === false) {
    return input.toString()
  } else if (fieldMeta.datatype === 'date') {
    return moment(input).format('MM/DD/YYYY HH:mm:ss')
  } else if (_.isObject(input)) {
    return JSON.stringify(input, null, 2)
  } else {
    return input
  }
}

// NOTE: PureComponent's shallow compare works for this component
// because the isRunning prop will toggle with each query execution
// It would otherwise not rerender on change of prop.queryResult alone
class QueryResultDataTable extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      gridWidth: 0,
      gridHeight: 0
    }
    // This binding is necessary to make `this` work in the callback
    this.handleResize = this.handleResize.bind(this)
  }

  handleResize (e) {
    var resultGrid = document.getElementById('result-grid')
    if (resultGrid) {
      this.setState({
        gridHeight: resultGrid.clientHeight,
        gridWidth: resultGrid.clientWidth
      })
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
  }

  render () {
    if (this.props.isRunning) {
      return (
        <div id='result-grid' className='run-result-notification'>
          <SpinKitCube />
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
                  backgroundColor: '#bae6f7'
                }
                numberBar = <div style={barStyle} />
              }
              return (
                <Cell>
                  {numberBar}
                  <div style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: cellWidth, position: 'absolute'}}>
                    {renderValue(value, fieldMeta)}
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
}

export default QueryResultDataTable
