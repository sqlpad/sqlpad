import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Select from '../common/Select';
import Sidebar from '../common/Sidebar';
import SidebarBody from '../common/SidebarBody';
import {
  handleChartConfigurationFieldsChange,
  handleChartTypeChange
} from '../stores/queries';
import chartDefinitions from '../utilities/chartDefinitions.js';
import ChartInputs from './ChartInputs.js';

function mapStateToProps(state) {
  return {
    queryResult: state.queryResult,
    chartType:
      state.query &&
      state.query.chartConfiguration &&
      state.query.chartConfiguration.chartType,
    fields:
      state.query &&
      state.query.chartConfiguration &&
      state.query.chartConfiguration.fields
  };
}

const ConnectedVisSidebar = connect(
  mapStateToProps,
  { handleChartConfigurationFieldsChange, handleChartTypeChange }
)(React.memo(VisSidebar));

function VisSidebar({
  chartType,
  fields,
  queryResult,
  handleChartTypeChange,
  handleChartConfigurationFieldsChange,
  queryId
}) {
  const chartOptions = chartDefinitions.map(d => {
    return (
      <option key={d.chartType} value={d.chartType}>
        {d.chartLabel}
      </option>
    );
  });

  return (
    <Sidebar>
      <SidebarBody>
        <Select
          className="w-100"
          value={chartType}
          onChange={event => handleChartTypeChange(event.target.value)}
        >
          <option value="" />
          {chartOptions}
        </Select>
        <ChartInputs
          chartType={chartType}
          queryChartConfigurationFields={fields}
          onChartConfigurationFieldsChange={
            handleChartConfigurationFieldsChange
          }
          queryResult={queryResult}
        />
      </SidebarBody>
    </Sidebar>
  );
}

VisSidebar.propTypes = {
  onChartConfigurationFieldsChange: PropTypes.func,
  onChartTypeChange: PropTypes.func,
  onSaveImageClick: PropTypes.func,
  query: PropTypes.object,
  queryId: PropTypes.string,
  queryResult: PropTypes.object
};

export default ConnectedVisSidebar;
