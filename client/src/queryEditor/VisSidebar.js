import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import PropTypes from 'prop-types';
import React from 'react';
import Sidebar from '../common/Sidebar';
import SidebarBody from '../common/SidebarBody';
import chartDefinitions from '../utilities/chartDefinitions.js';
import ChartInputs from './ChartInputs.js';

const { Option } = Select;

function VisSidebar({
  onChartConfigurationFieldsChange,
  onChartTypeChange,
  onSaveImageClick,
  query,
  queryResult
}) {
  const chartOptions = chartDefinitions.map(d => {
    return (
      <Option key={d.chartType} value={d.chartType}>
        {d.chartLabel}
      </Option>
    );
  });

  return (
    <Sidebar>
      <SidebarBody>
        <Select
          allowClear
          showSearch
          className="w-100"
          optionFilterProp="children"
          value={query.chartConfiguration.chartType}
          notFoundContent="No charts available"
          onChange={onChartTypeChange}
          filterOption={(input, option) =>
            option.props.value &&
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
              0
          }
        >
          {chartOptions}
        </Select>
        <ChartInputs
          chartType={query.chartConfiguration.chartType}
          queryChartConfigurationFields={query.chartConfiguration.fields}
          onChartConfigurationFieldsChange={onChartConfigurationFieldsChange}
          queryResult={queryResult}
        />
      </SidebarBody>
      <div className="pa2 bt b--near-white">
        <Button className="w-100 mb1" onClick={onSaveImageClick}>
          <Icon type="download" /> Save Chart Image
        </Button>
      </div>
    </Sidebar>
  );
}

VisSidebar.propTypes = {
  onChartConfigurationFieldsChange: PropTypes.func,
  onChartTypeChange: PropTypes.func,
  onSaveImageClick: PropTypes.func,
  query: PropTypes.object,
  queryResult: PropTypes.object
};

export default VisSidebar;
