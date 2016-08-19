var React = require('react');
var SecondsTimer = require('./SecondsTimer.js');
var moment = require('moment');
import {Table, Column, Cell} from 'fixed-data-table'; // react's fixed data table

var QueryResultDataTable = React.createClass({
    getInitialState: function () {
        return {
            gridWidth: 0,
            gridHeight: 0
        }
    },
    handleResize: function(e) {
        var resultGrid = document.getElementById('result-grid');
        if (resultGrid) {
            this.setState({
                gridHeight: resultGrid.clientHeight,
                gridWidth: resultGrid.clientWidth
            });
        }
    },
    componentDidMount: function () {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
    },
    render: function () {
        if (this.props.isRunning) {
            return  (
                <div id="result-grid" className="run-result-notification">
                    running...<br/>
                    <SecondsTimer startTime={this.props.runQueryStartTime} />
                </div>
            );
        } else if (!this.props.querySuccess && this.props.queryError) {
            return (
                <div id="result-grid" className="run-result-notification label-danger">
                    {this.props.queryError}
                </div>
            );
        } else if (this.props.queryResult && this.props.queryResult.rows) {
            var queryResult = this.props.queryResult;
            var columnNodes = queryResult.fields.map(function (field) {
                    
                var valueLength = queryResult.meta[field].maxValueLength;
                if (field.length > valueLength) valueLength = field.length;       
                var columnWidth = valueLength * 20;
                if (columnWidth < 200) columnWidth = 200;
                else if (columnWidth > 350) columnWidth = 350;
                var cellWidth = columnWidth - 10;

                var renderValue = (input) => {
                    if (queryResult.meta[field].datatype == 'date') {
                        return moment(input).format('MM/DD/YYYY HH:mm:ss');
                    } else {
                        return input;
                    }
                }

                return (
                    <Column
                        key={field}
                        header={<Cell>{field}</Cell>}
                        cell={({rowIndex}) => (
                            <Cell>
                                <div style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: cellWidth}}>
                                    {renderValue(queryResult.rows[rowIndex][field])}
                                </div>
                            </Cell>
                        )}
                        width={columnWidth}
                        />
                )
            })
            return (
                <div id="result-grid">
                    <Table
                        rowHeight={30}
                        rowsCount={queryResult.rows.length}
                        width={this.state.gridWidth}
                        height={this.state.gridHeight}
                        headerHeight={30}>
                        {columnNodes}
                    </Table>
                </div>
            );
        } else {
            return <div id="result-grid"></div>;
        }
    }
});

module.exports = QueryResultDataTable;