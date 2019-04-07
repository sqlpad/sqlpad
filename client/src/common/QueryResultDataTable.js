import React from 'react';
import PropTypes from 'prop-types';
import { MultiGrid } from 'react-virtualized';
import Draggable from 'react-draggable';
import Measure from 'react-measure';
import SpinKitCube from './SpinKitCube.js';
import moment from 'moment';
import 'react-virtualized/styles.css';

const renderValue = (input, fieldMeta) => {
  if (input === null || input === undefined) {
    return <em>null</em>;
  } else if (input === true || input === false) {
    return input.toString();
  } else if (fieldMeta.datatype === 'date') {
    return moment.utc(input).format('MM/DD/YYYY HH:mm:ss');
  } else if (typeof input === 'object') {
    return JSON.stringify(input, null, 2);
  } else {
    return input;
  }
};

const renderNumberBar = (value, fieldMeta) => {
  if (fieldMeta.datatype === 'number') {
    const valueNumber = Number(value);
    const range = fieldMeta.max - (fieldMeta.min < 0 ? fieldMeta.min : 0);
    let left = 0;
    if (fieldMeta.min < 0 && valueNumber < 0) {
      left = (Math.abs(fieldMeta.min - valueNumber) / range) * 100 + '%';
    } else if (fieldMeta.min < 0 && valueNumber >= 0) {
      left = (Math.abs(fieldMeta.min) / range) * 100 + '%';
    }
    const barStyle = {
      position: 'absolute',
      left: left,
      bottom: 0,
      height: '2px',
      width: (Math.abs(valueNumber) / range) * 100 + '%',
      backgroundColor: '#555'
    };
    return <div style={barStyle} />;
  }
};

// NOTE: PureComponent's shallow compare works for this component
// because the isRunning prop will toggle with each query execution
// It would otherwise not rerender on change of prop.queryResult alone
class QueryResultDataTable extends React.PureComponent {
  state = {
    dimensions: {
      width: -1,
      height: -1
    },
    columnWidths: {}
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { queryResult } = nextProps;
    const { columnWidths } = prevState;

    if (queryResult && queryResult.fields) {
      queryResult.fields.forEach(field => {
        if (!columnWidths[field]) {
          const fieldMeta = queryResult.meta[field];
          let valueLength = fieldMeta.maxValueLength;

          if (field.length > valueLength) {
            valueLength = field.length;
          }
          let columnWidthGuess = valueLength * 20;
          if (columnWidthGuess < 100) {
            columnWidthGuess = 100;
          } else if (columnWidthGuess > 350) {
            columnWidthGuess = 350;
          }

          columnWidths[field] = columnWidthGuess;
        }
      });
    }
    return { columnWidths };
  }

  headerCellRenderer = ({ columnIndex, key, style }) => {
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[columnIndex];

    // If dataKey is present this is an actual header to render
    if (dataKey) {
      return (
        <div
          className={
            'flex bb b--moon-gray justify-between ph2 fw7 bg-near-white'
          }
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
      );
    }

    // If this is a dummy header cell render an empty header cell
    return (
      <div
        className={'flex bb b--moon-gray justify-between ph2 fw7 bg-near-white'}
        key={key}
        style={Object.assign({}, style, { lineHeight: '30px' })}
      />
    );
  };

  dataCellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[columnIndex];
    const backgroundColor = rowIndex % 2 === 0 ? 'bg-near-white' : '';

    // If dataKey is present this is a real data cell to render
    if (dataKey) {
      const fieldMeta = queryResult.meta[dataKey];

      // Account for extra row that was used for header row
      const value = queryResult.rows[rowIndex - 1][dataKey];

      return (
        <div
          className={'relative bb b--light-gray ph2 ' + backgroundColor}
          key={key}
          style={Object.assign({}, style, { lineHeight: '30px' })}
        >
          {renderNumberBar(value, fieldMeta)}
          <div className="truncate">{renderValue(value, fieldMeta)}</div>
        </div>
      );
    }

    // If no dataKey this is a dummy cell.
    // It should render nothing, but match the row's style
    return (
      <div
        className={'relative bb b--light-gray ph2 ' + backgroundColor}
        key={key}
        style={Object.assign({}, style, { lineHeight: '30px' })}
      >
        <div className="truncate" />
      </div>
    );
  };

  cellRenderer = params => {
    if (params.rowIndex === 0) {
      return this.headerCellRenderer(params);
    }
    return this.dataCellRenderer(params);
  };

  resizeColumn = ({ dataKey, deltaX }) => {
    this.setState(prevState => {
      const prevWidths = prevState.columnWidths;
      const newWidth = prevWidths[dataKey] + deltaX;
      return {
        columnWidths: {
          ...prevWidths,
          [dataKey]: newWidth > 100 ? newWidth : 100
        }
      };
    });
    if (this.ref) {
      this.ref.recomputeGridSize();
    }
  };

  // NOTE
  // An empty dummy column is added to the grid for visual purposes
  // If dataKey was found this is a real column of data from the query result
  // If not, it's the dummy column at the end, and it should fill the rest of the grid width
  getColumnWidth = ({ index }) => {
    const { columnWidths } = this.state;
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[index];
    const { width } = this.state.dimensions;

    if (dataKey) {
      return columnWidths[dataKey];
    }

    const totalWidthFilled = queryResult.fields
      .map(key => columnWidths[key])
      .reduce((prev, curr) => prev + curr, 0);

    const fakeColumnWidth = width - totalWidthFilled;
    return fakeColumnWidth < 10 ? 10 : fakeColumnWidth;
  };

  handleScrollBug = () => {
    // There's a strange bug when using Chrome.
    // When the Ace editor is focused, and the user scrolls horizontally on result grid
    // the cursor appears to stay focused on the Ace editor, but no input is accepted other than deletes.
    // The frozen input behavior goes away if another element is given focus,
    // and then the user clicks on the Ace editor again.
    // Fortunately clearing focus on the focused element and refocusing it fixes this bug.
    const element = document.activeElement;
    if (element) {
      element.blur();
      element.focus();
    }
  };

  render() {
    const { isRunning, queryError, queryResult } = this.props;
    const { height, width } = this.state.dimensions;

    if (isRunning) {
      return (
        <div
          id="result-grid"
          className="aspect-ratio--object flex items-center justify-center"
        >
          <SpinKitCube />
        </div>
      );
    }

    if (queryError) {
      return (
        <div
          id="result-grid"
          className={`aspect-ratio--object flex items-center justify-center f2 pa4 tc bg-light-red`}
        >
          {queryError}
        </div>
      );
    }

    if (queryResult && queryResult.rows) {
      // Add extra row to account for header row
      const rowCount = queryResult.rows.length + 1;
      // Add extra column to fill remaining grid width if necessary
      const columnCount = queryResult.fields.length + 1;

      return (
        <Measure
          bounds
          onResize={contentRect => {
            this.setState({ dimensions: contentRect.bounds });
          }}
        >
          {({ measureRef }) => (
            <div
              ref={measureRef}
              id="result-grid"
              className="h-100 w-100 aspect-ratio--object "
            >
              <MultiGrid
                width={width}
                height={height}
                rowHeight={30}
                ref={ref => (this.ref = ref)}
                columnWidth={this.getColumnWidth}
                columnCount={columnCount}
                rowCount={rowCount}
                cellRenderer={this.cellRenderer}
                fixedRowCount={1}
                onScroll={this.handleScrollBug}
              />
            </div>
          )}
        </Measure>
      );
    }

    return <div id="result-grid" className="aspect-ratio--object" />;
  }
}

QueryResultDataTable.propTypes = {
  isRunning: PropTypes.bool,
  queryError: PropTypes.string,
  queryResult: PropTypes.object
};

export default QueryResultDataTable;
