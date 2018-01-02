import React from 'react'
import { Table, Column, Cell } from 'fixed-data-table-2'
import SpinKitCube from './SpinKitCube.js'
import moment from 'moment'
import '../css/fixed-data-table.css'

const renderValue = (input, fieldMeta) => {
  if (input === null || input === undefined) {
    return <em>null</em>
  } else if (input === true || input === false) {
    return input.toString()
  } else if (fieldMeta.datatype === 'date') {
    return moment.utc(input).format('MM/DD/YYYY HH:mm:ss')
  } else if (typeof input === 'object') {
    return JSON.stringify(input, null, 2)
  } else {
    return input
  }
}

// NOTE: PureComponent's shallow compare works for this component
// because the isRunning prop will toggle with each query execution
// It would otherwise not rerender on change of prop.queryResult alone
class QueryResultDataTable extends React.PureComponent {
  state = {
    gridWidth: 0,
    gridHeight: 0,
    columnWidths: {}
  }

  handleResize = e => {
    const resultGrid = document.getElementById('result-grid')
    if (resultGrid) {
      this.setState({
        gridHeight: resultGrid.clientHeight,
        gridWidth: resultGrid.clientWidth
      })
    }
  }

  handleColumnResizeEnd = (newColumnWidth, columnKey) => {
    this.setState(({ columnWidths }) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth
      }
    }))
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    if (this.props.isRunning) {
      return (
        <div
          id="result-grid"
          className="aspect-ratio--object flex items-center justify-center"
        >
          <SpinKitCube />
        </div>
      )
    } else if (this.props.queryError) {
      return (
        <div
          id="result-grid"
          className={`aspect-ratio--object flex items-center justify-center f2 pa4 tc bg-light-red`}
        >
          {this.props.queryError}
        </div>
      )
    } else if (this.props.queryResult && this.props.queryResult.rows) {
      const { columnWidths } = this.state
      const queryResult = this.props.queryResult
      const columnNodes = queryResult.fields.map(function(field) {
        const fieldMeta = queryResult.meta[field]
        let valueLength = fieldMeta.maxValueLength

        if (field.length > valueLength) {
          valueLength = field.length
        }
        let columnWidthGuess = valueLength * 20
        if (columnWidthGuess < 200) {
          columnWidthGuess = 200
        } else if (columnWidthGuess > 350) {
          columnWidthGuess = 350
        }

        const columnWidth = columnWidths[field] || columnWidthGuess

        return (
          <Column
            columnKey={field}
            key={field}
            isResizable
            header={<Cell>{field}</Cell>}
            cell={({ rowIndex }) => {
              const value = queryResult.rows[rowIndex][field]
              let barStyle
              let numberBar
              if (fieldMeta.datatype === 'number') {
                const valueNumber = Number(value)
                const range =
                  fieldMeta.max - (fieldMeta.min < 0 ? fieldMeta.min : 0)
                let left = 0
                if (fieldMeta.min < 0 && valueNumber < 0) {
                  left =
                    Math.abs(fieldMeta.min - valueNumber) / range * 100 + '%'
                } else if (fieldMeta.min < 0 && valueNumber >= 0) {
                  left = Math.abs(fieldMeta.min) / range * 100 + '%'
                }
                barStyle = {
                  position: 'absolute',
                  left: left,
                  bottom: 0,
                  height: '2px',
                  width: Math.abs(valueNumber) / range * 100 + '%',
                  backgroundColor: '#555'
                }
                numberBar = <div style={barStyle} />
              }
              return (
                <Cell>
                  {numberBar}
                  <div style={{ whiteSpace: 'nowrap' }}>
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
        <div id="result-grid" className="aspect-ratio--object">
          <Table
            rowHeight={30}
            rowsCount={queryResult.rows.length}
            width={this.state.gridWidth}
            height={this.state.gridHeight}
            headerHeight={30}
            onColumnResizeEndCallback={this.handleColumnResizeEnd}
          >
            {columnNodes}
          </Table>
        </div>
      )
    } else {
      return <div id="result-grid" className="aspect-ratio--object" />
    }
  }
}

export default QueryResultDataTable
