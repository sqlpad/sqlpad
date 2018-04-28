import React from 'react'
import { Column, Table } from 'react-virtualized'
import Draggable from 'react-draggable'
import SpinKitCube from './SpinKitCube.js'
import moment from 'moment'
import 'react-virtualized/styles.css' // only needs to be imported once

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

  static getDerivedStateFromProps(nextProps, prevState) {
    const { queryResult } = nextProps
    const { columnWidths } = prevState

    if (queryResult && queryResult.fields) {
      queryResult.fields.forEach(field => {
        if (!columnWidths[field]) {
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

          columnWidths[field] = columnWidthGuess
        }
      })
    }
    return { columnWidths }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  renderColumns() {
    const { queryResult } = this.props
    const { columnWidths } = this.state

    return queryResult.fields.map(field => {
      return (
        <Column
          headerRenderer={this.headerRenderer}
          cellRenderer={this.cellRenderer}
          key={field}
          dataKey={field}
          label={field}
          width={columnWidths[field]}
        />
      )
    })
  }

  headerRenderer = ({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection
  }) => {
    return (
      <React.Fragment key={dataKey}>
        <div className="ReactVirtualized__Table__headerTruncatedText">
          {label}
        </div>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onDrag={(event, { deltaX }) =>
            this.resizeRow({
              dataKey,
              deltaX
            })
          }
          position={{ x: 0 }}
          zIndex={999}
        >
          <span className="DragHandleIcon">⋮</span>
        </Draggable>
      </React.Fragment>
    )
  }

  cellRenderer = ({
    cellData,
    columnData,
    columnIndex,
    dataKey,
    isScrolling,
    rowData,
    rowIndex
  }) => {
    const { queryResult } = this.props
    const fieldMeta = queryResult.meta[dataKey]

    const value = rowData[dataKey]
    let barStyle
    let numberBar
    if (fieldMeta.datatype === 'number') {
      const valueNumber = Number(value)
      const range = fieldMeta.max - (fieldMeta.min < 0 ? fieldMeta.min : 0)
      let left = 0
      if (fieldMeta.min < 0 && valueNumber < 0) {
        left = Math.abs(fieldMeta.min - valueNumber) / range * 100 + '%'
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
      <div className="relative" style={{ lineHeight: '30px' }}>
        {numberBar}
        <div style={{ whiteSpace: 'nowrap' }}>
          {renderValue(value, fieldMeta)}
        </div>
      </div>
    )
  }

  rowClassName = ({ index }) => {
    return index % 2 === 0 ? 'bg-near-white' : ''
  }

  resizeRow = ({ dataKey, deltaX }) => {
    this.setState(prevState => {
      const prevWidths = prevState.columnWidths
      return {
        columnWidths: {
          ...prevWidths,
          [dataKey]: prevWidths[dataKey] + deltaX
        }
      }
    })
  }

  render() {
    const { isRunning, queryError, queryResult } = this.props
    const { gridHeight, gridWidth } = this.state

    if (isRunning) {
      return (
        <div
          id="result-grid"
          className="aspect-ratio--object flex items-center justify-center"
        >
          <SpinKitCube />
        </div>
      )
    }

    if (queryError) {
      return (
        <div
          id="result-grid"
          className={`aspect-ratio--object flex items-center justify-center f2 pa4 tc bg-light-red`}
        >
          {queryError}
        </div>
      )
    }

    if (queryResult && queryResult.rows) {
      return (
        <div id="result-grid" className="aspect-ratio--object">
          <Table
            width={gridWidth}
            height={gridHeight}
            headerHeight={30}
            rowHeight={30}
            rowCount={queryResult.rows.length}
            rowGetter={({ index }) => queryResult.rows[index]}
            rowClassName={this.rowClassName}
          >
            {this.renderColumns()}
          </Table>
        </div>
      )
    }

    return <div id="result-grid" className="aspect-ratio--object" />
  }
}

export default QueryResultDataTable
