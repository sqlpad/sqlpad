import React from 'react'
import { MultiGrid } from 'react-virtualized'
import Draggable from 'react-draggable'
import SpinKitCube from './SpinKitCube.js'
import moment from 'moment'
import 'react-virtualized/styles.css'

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
          if (columnWidthGuess < 100) {
            columnWidthGuess = 100
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

  headerCellRenderer = ({
    columnIndex,
    isScrolling,
    isVisible,
    key,
    parent,
    rowIndex,
    style
  }) => {
    const { queryResult } = this.props
    const dataKey = queryResult.fields[columnIndex]

    return (
      <div
        className={'flex bb b--moon-gray justify-between ph2 fw7 bg-near-white'}
        key={key}
        style={Object.assign({}, style, { lineHeight: '30px' })}
      >
        <div>{dataKey}</div>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          onDrag={(event, { deltaX }) =>
            this.resizeColumn({
              dataKey,
              deltaX
            })
          }
          position={{ x: 0 }}
          zIndex={999}
        >
          <span className="DragHandleIcon">⋮</span>
        </Draggable>
      </div>
    )
  }

  dataCellRenderer = ({
    columnIndex,
    isScrolling,
    isVisible,
    key,
    parent,
    rowIndex,
    style
  }) => {
    const { queryResult } = this.props
    const dataKey = queryResult.fields[columnIndex]
    const fieldMeta = queryResult.meta[dataKey]

    const value = queryResult.rows[rowIndex - 1][dataKey]
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

    const backgroundColor = rowIndex % 2 === 0 ? 'bg-near-white' : ''
    return (
      <div
        className={'relative bb b--light-gray ph2 ' + backgroundColor}
        key={key}
        style={Object.assign({}, style, { lineHeight: '30px' })}
      >
        {numberBar}
        <div className="truncate">{renderValue(value, fieldMeta)}</div>
      </div>
    )
  }

  cellRenderer = params => {
    if (params.rowIndex === 0) {
      return this.headerCellRenderer(params)
    }
    return this.dataCellRenderer(params)
  }

  resizeColumn = ({ dataKey, deltaX }) => {
    this.setState(prevState => {
      const prevWidths = prevState.columnWidths
      const newWidth = prevWidths[dataKey] + deltaX
      return {
        columnWidths: {
          ...prevWidths,
          [dataKey]: newWidth > 100 ? newWidth : 100
        }
      }
    })
    if (this.ref) {
      this.ref.recomputeGridSize()
    }
  }

  getColumnWidth = ({ index }) => {
    const { columnWidths } = this.state
    const { queryResult } = this.props
    const dataKey = queryResult.fields[index]
    const width = columnWidths[dataKey]
    return width
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
      // Add extra row to account for header row
      const rowCount = queryResult.rows.length + 1
      return (
        <div id="result-grid" className="aspect-ratio--object">
          <MultiGrid
            width={gridWidth}
            height={gridHeight}
            rowHeight={30}
            ref={ref => (this.ref = ref)}
            columnWidth={this.getColumnWidth}
            columnCount={queryResult.fields.length}
            rowCount={rowCount}
            cellRenderer={this.cellRenderer}
            fixedRowCount={1}
          />
        </div>
      )
    }

    return <div id="result-grid" className="aspect-ratio--object" />
  }
}

export default QueryResultDataTable
