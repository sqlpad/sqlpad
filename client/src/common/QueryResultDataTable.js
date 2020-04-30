import React from 'react';
import PropTypes from 'prop-types';
import { VariableSizeGrid } from 'react-window';
import throttle from 'lodash/throttle';
import Draggable from 'react-draggable';
import Measure from 'react-measure';

const renderValue = (input, fieldMeta) => {
  if (input === null || input === undefined) {
    return <em>null</em>;
  } else if (input === true || input === false) {
    return input.toString();
  } else if (fieldMeta.datatype === 'datetime') {
    // Remove the letters from ISO string and present as is
    return input.replace('T', ' ').replace('Z', '');
  } else if (fieldMeta.datatype === 'date') {
    // Formats ISO string to YYYY-MM-DD
    return input.substring(0, 10);
  } else if (typeof input === 'object') {
    return JSON.stringify(input, null, 2);
  } else if (typeof input === 'string' && input.match('^https?://')) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={input}>
        {input}
      </a>
    );
  } else {
    return input;
  }
};

/**
 * There's a strange bug when using Chrome.
 * When the Ace editor is focused, and the user scrolls horizontally on result grid
 * the cursor appears to stay focused on the Ace editor, but no input is accepted other than deletes.
 * The frozen input behavior goes away if another element is given focus,
 * and then the user clicks on the Ace editor again.
 * Fortunately clearing focus on the focused element and refocusing it fixes this bug.
 *
 * This was removed with the change from react-virtualized to react-window, but the problem persists.
 * This is likely an ace editor issue and should probably stay until the editor is fixed
 * or changed to something else like monaco
 *
 * UPDATE: this also happens if you run a query with results then follow it with a query that errors out.
 * To counter this the blur/focus has been added after component will unmount.
 */
function handleFrozenAceBug() {
  const element = document.activeElement;
  if (element) {
    element.blur();
    element.focus();
  }
}

// Hide the overflow so the scroll bar never shows in the header grid
const headerStyle = {
  overflowX: 'hidden',
  overflowY: 'hidden',
};

const headerCellStyle = {
  lineHeight: '30px',
  backgroundColor: '#f4f4f4',
  justifyContent: 'space-between',
  borderBottom: '1px solid #CCC',
  display: 'flex',
  paddingLeft: '.5rem',
  paddingRight: '.5rem',
};

const cellStyle = {
  lineHeight: '30px',
  paddingLeft: '.5rem',
  paddingRight: '.5rem',
  borderBottom: '1px solid #CCC',
  display: 'relative',
};

// NOTE: PureComponent's shallow compare works for this component
// because the isRunning prop will toggle with each query execution
// It would otherwise not rerender on change of prop.queryResult alone
class QueryResultDataTable extends React.PureComponent {
  state = {
    dimensions: {
      width: -1,
      height: -1,
    },
    columnWidths: {},
  };

  componentWillUnmount() {
    setTimeout(() => {
      handleFrozenAceBug();
    }, 300);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { queryResult } = nextProps;
    const { columnWidths } = prevState;

    if (queryResult && queryResult.fields) {
      queryResult.fields.forEach((field) => {
        if (!columnWidths[field]) {
          const fieldMeta = queryResult.meta[field];
          // (This length is number of characters -- it later gets assigned ~ 20px per char)
          let valueLength = fieldMeta.maxValueLength || 8;

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

  // NOTE
  // An empty dummy column is added to the grid for visual purposes
  // If dataKey was found this is a real column of data from the query result
  // If not, it's the dummy column at the end, and it should fill the rest of the grid width
  getColumnWidth = (index) => {
    const { columnWidths } = this.state;
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[index];
    const { width } = this.state.dimensions;

    if (dataKey) {
      return columnWidths[dataKey];
    }

    const totalWidthFilled = queryResult.fields
      .map((key) => columnWidths[key])
      .reduce((prev, curr) => prev + curr, 0);

    const fakeColumnWidth = width - totalWidthFilled;
    return fakeColumnWidth < 10 ? 10 : fakeColumnWidth;
  };

  headerGrid = React.createRef();
  bodyGrid = React.createRef();

  resizeColumn = ({ dataKey, deltaX, columnIndex }) => {
    this.setState(
      (prevState) => {
        const prevWidths = prevState.columnWidths;
        const newWidth = prevWidths[dataKey] + deltaX;
        return {
          columnWidths: {
            ...prevWidths,
            [dataKey]: newWidth > 100 ? newWidth : 100,
          },
        };
      },
      () => {
        this.recalc(columnIndex);
        handleFrozenAceBug();
      }
    );
  };

  recalc = throttle((columnIndex) => {
    if (this.headerGrid.current.resetAfterColumnIndex) {
      this.headerGrid.current.resetAfterColumnIndex(columnIndex);
      this.bodyGrid.current.resetAfterColumnIndex(columnIndex);
    }
  }, 100);

  HeaderCell = ({ columnIndex, rowIndex, style }) => {
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[columnIndex];

    // If dataKey is present this is an actual header to render
    if (dataKey) {
      return (
        <div style={Object.assign({}, style, headerCellStyle)}>
          <div>{dataKey}</div>
          <Draggable
            axis="x"
            defaultClassName="DragHandle"
            defaultClassNameDragging="DragHandleActive"
            onDrag={(event, { deltaX }) => {
              this.resizeColumn({ dataKey, deltaX, columnIndex });
            }}
            position={{ x: 0 }}
            zIndex={999}
          >
            <span className="DragHandleIcon">⋮</span>
          </Draggable>
        </div>
      );
    }

    // If this is a dummy header cell render an empty header cell
    return <div style={Object.assign({}, style, headerCellStyle)} />;
  };

  Cell = ({ columnIndex, rowIndex, style }) => {
    const { queryResult } = this.props;
    const dataKey = queryResult.fields[columnIndex];
    const finalStyle = Object.assign({}, style, cellStyle);
    if (rowIndex % 2 === 0) {
      finalStyle.backgroundColor = '#fafafa';
    }

    // If dataKey is present this is a real data cell to render
    if (dataKey) {
      const fieldMeta = queryResult.meta[dataKey];

      // Account for extra row that was used for header row
      const value = queryResult.rows[rowIndex][dataKey];

      return (
        <div style={finalStyle}>
          <div className="truncate">{renderValue(value, fieldMeta)}</div>
        </div>
      );
    }

    // If no dataKey this is a dummy cell.
    // It should render nothing, but match the row's style
    return (
      <div style={finalStyle}>
        <div className="truncate" />
      </div>
    );
  };

  getRowHeight() {
    return 30;
  }

  // When a scroll occurs in the body grid,
  // synchronize the scroll position of the header grid
  handleGridScroll = ({ scrollLeft }) => {
    this.headerGrid.current.scrollTo({ scrollLeft });
    handleFrozenAceBug();
  };

  handleContainerResize = (contentRect) => {
    this.setState({ dimensions: contentRect.bounds });
  };

  render() {
    const { queryResult } = this.props;
    const { height, width } = this.state.dimensions;

    if (queryResult && queryResult.rows) {
      const rowCount = queryResult.rows.length;
      // Add extra column to fill remaining grid width if necessary
      const columnCount = queryResult.fields.length + 1;

      return (
        <Measure bounds onResize={this.handleContainerResize}>
          {({ measureRef }) => (
            <div ref={measureRef} className="h-100 w-100">
              <VariableSizeGrid
                columnCount={columnCount}
                rowCount={1}
                columnWidth={this.getColumnWidth}
                rowHeight={this.getRowHeight}
                height={30}
                width={width}
                ref={this.headerGrid}
                style={headerStyle}
              >
                {this.HeaderCell}
              </VariableSizeGrid>
              <VariableSizeGrid
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={this.getColumnWidth}
                rowHeight={this.getRowHeight}
                width={width}
                height={height - 30}
                ref={this.bodyGrid}
                onScroll={this.handleGridScroll}
              >
                {this.Cell}
              </VariableSizeGrid>
            </div>
          )}
        </Measure>
      );
    }

    return null;
  }
}

QueryResultDataTable.propTypes = {
  queryResult: PropTypes.object,
};

export default QueryResultDataTable;
