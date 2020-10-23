import React from 'react';
import { VariableSizeGrid } from 'react-window';
import throttle from 'lodash/throttle';
import Draggable from 'react-draggable';
import Measure from 'react-measure';

interface FieldMeta {
  datatype: string;
}

// https://davidwalsh.name/detect-scrollbar-width
const scrollbarWidth = () => {
  const scrollDiv = document.createElement('div');
  scrollDiv.setAttribute(
    'style',
    'width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;'
  );
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
};

const renderValue = (input: any, fieldMeta: FieldMeta) => {
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

// Hide the overflow so the scroll bar never shows in the header grid
const headerStyle: React.CSSProperties = {
  overflowX: 'hidden',
  overflowY: 'hidden',
};

const bodyStyle: React.CSSProperties = {
  overflow: 'scroll',
};

const headerCellStyle: React.CSSProperties = {
  lineHeight: '30px',
  backgroundColor: '#f4f4f4',
  justifyContent: 'space-between',
  borderBottom: '1px solid #CCC',
  display: 'flex',
  fontWeight: 'bold',
  paddingLeft: '.5rem',
  paddingRight: '.5rem',
};

const cellStyle: React.CSSProperties = {
  lineHeight: '30px',
  paddingLeft: '.5rem',
  paddingRight: '.5rem',
  borderBottom: '1px solid #CCC',
  display: 'relative',
};

interface QueryResultDataTableProps {
  queryResult: any;
}

interface QueryResultDataTableState {
  dimensions: {
    width: number;
    height: number;
  };
  columnWidths: {
    [key: string]: number;
  };
  scrollbarWidth: number;
}

interface Column {
  name: string;
  maxValueLength: number;
}

// NOTE: PureComponent's shallow compare works for this component
// because the isRunning prop will toggle with each query execution
// It would otherwise not rerender on change of prop.queryResult alone
class QueryResultDataTable extends React.PureComponent<
  QueryResultDataTableProps,
  QueryResultDataTableState
> {
  state: QueryResultDataTableState = {
    dimensions: {
      width: -1,
      height: -1,
    },
    columnWidths: {},
    scrollbarWidth: 0,
  };

  componentDidMount = () => {
    this.setState({ scrollbarWidth: scrollbarWidth() });
  };

  static getDerivedStateFromProps(
    nextProps: QueryResultDataTableProps,
    prevState: QueryResultDataTableState
  ) {
    const { queryResult } = nextProps;
    const { columnWidths } = prevState;

    if (queryResult && queryResult.columns) {
      queryResult.columns.forEach((column: Column) => {
        const { name, maxValueLength } = column;
        if (!columnWidths[name]) {
          // (This length is number of characters -- it later gets assigned ~ 20px per char)
          let valueLength = maxValueLength || 8;

          if (name.length > valueLength) {
            valueLength = name.length;
          }
          let columnWidthGuess = valueLength * 20;
          if (columnWidthGuess < 100) {
            columnWidthGuess = 100;
          } else if (columnWidthGuess > 350) {
            columnWidthGuess = 350;
          }

          columnWidths[name] = columnWidthGuess;
        }
      });
    }
    return { columnWidths };
  }

  // NOTE
  // An empty dummy column is added to the grid for visual purposes
  // If dataKey was found this is a real column of data from the query result
  // If not, it's the dummy column at the end, and it should fill the rest of the grid width
  getColumnWidth = (index: number) => {
    const { columnWidths, scrollbarWidth, dimensions } = this.state;
    const { queryResult } = this.props;
    const column: Column = queryResult.columns[index];
    const { width } = dimensions;

    if (column) {
      return columnWidths[column.name];
    }

    const totalWidthFilled = queryResult.columns
      .map((col: Column) => columnWidths[col.name])
      .reduce((prev: number, curr: number) => prev + curr, 0);

    const fakeColumnWidth = width - totalWidthFilled - scrollbarWidth;
    return fakeColumnWidth < 10 ? 10 : fakeColumnWidth;
  };

  headerGrid = React.createRef<VariableSizeGrid>();
  bodyGrid = React.createRef<VariableSizeGrid>();

  resizeColumn = ({
    dataKey,
    deltaX,
    columnIndex,
  }: {
    dataKey: string;
    deltaX: number;
    columnIndex: number;
  }) => {
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
      }
    );
  };

  recalc = throttle((columnIndex) => {
    if (this.headerGrid?.current?.resetAfterColumnIndex) {
      this.headerGrid.current.resetAfterColumnIndex(columnIndex);
      this.bodyGrid?.current?.resetAfterColumnIndex(columnIndex);
    }
  }, 100);

  HeaderCell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const { queryResult } = this.props;
    const column = queryResult.columns[columnIndex];

    // If dataKey is present this is an actual header to render
    if (column) {
      return (
        <div style={Object.assign({}, style, headerCellStyle)}>
          <div>{column.name}</div>
          <Draggable
            axis="x"
            defaultClassName="DragHandle"
            defaultClassNameDragging="DragHandleActive"
            onDrag={(event, { deltaX }) => {
              this.resizeColumn({ dataKey: column.name, deltaX, columnIndex });
            }}
            position={{ x: 0, y: 0 }}
            // zIndex={999}
          >
            <span className="DragHandleIcon">⋮</span>
          </Draggable>
        </div>
      );
    }

    // If this is a dummy header cell render an empty header cell
    return <div style={Object.assign({}, style, headerCellStyle)} />;
  };

  Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const { queryResult } = this.props;
    const column = queryResult.columns[columnIndex];
    const finalStyle = Object.assign({}, style, cellStyle);
    if (rowIndex % 2 === 0) {
      finalStyle.backgroundColor = '#fafafa';
    }

    // If dataKey is present this is a real data cell to render
    if (column) {
      const value = queryResult.rows[rowIndex][column.name];
      return (
        <div style={finalStyle}>
          <div className="truncate">{renderValue(value, column)}</div>
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
  handleGridScroll = ({ scrollLeft }: { scrollLeft: number }) => {
    // scrollTop previously was not supplied
    this.headerGrid?.current?.scrollTo({ scrollLeft, scrollTop: 0 });
  };

  handleContainerResize = (contentRect: any) => {
    this.setState({ dimensions: contentRect.bounds });
  };

  render() {
    const { queryResult } = this.props;
    const { height, width } = this.state.dimensions;

    if (queryResult && queryResult.rows && queryResult.columns) {
      const rowCount = queryResult.rows.length;
      // Add extra column to fill remaining grid width if necessary
      const columnCount = queryResult.columns.length + 1;

      return (
        <Measure bounds onResize={this.handleContainerResize}>
          {({ measureRef }) => (
            <div ref={measureRef} className="h-100 w-100">
              {/* 
                Visual hack - On Windows, scrollbar always showing in grid takes up some amount of room on side of content.
                To account for this, the header width is reduced by scrollbar width.
                This creates a small space in upper right corner that is unstyled.
                Visually, we want this to look like a continuation of the header row, so we render a div out of flow, behind the actual header
              */}
              <div
                style={{
                  ...headerCellStyle,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 30,
                }}
              />
              <VariableSizeGrid
                columnCount={columnCount}
                rowCount={1}
                columnWidth={this.getColumnWidth}
                rowHeight={this.getRowHeight}
                height={30}
                width={width - this.state.scrollbarWidth}
                ref={this.headerGrid}
                style={headerStyle}
              >
                {this.HeaderCell}
              </VariableSizeGrid>
              <VariableSizeGrid
                style={bodyStyle}
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

export default QueryResultDataTable;
