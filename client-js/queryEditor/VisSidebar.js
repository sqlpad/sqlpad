import React from 'react'
import PropTypes from 'prop-types'
import ChartInputs from './ChartInputs.js'
import chartDefinitions from '../utilities/chartDefinitions.js'
import Sidebar from '../common/Sidebar'
import SidebarBody from '../common/SidebarBody'

import Icon from 'antd/lib/icon'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'
const { Option } = Select

class VisSidebar extends React.Component {
  render() {
    const {
      isChartable,
      onChartConfigurationFieldsChange,
      onChartTypeChange,
      onSaveImageClick,
      onVisualizeClick,
      query,
      queryResult
    } = this.props

    const chartOptions = chartDefinitions.map(d => {
      return (
        <Option key={d.chartType} value={d.chartType}>
          {d.chartLabel}
        </Option>
      )
    })

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
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
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
        <div className="pa4 bt b--near-white">
          <Button
            className="w-100 mb3"
            onClick={onVisualizeClick}
            disabled={!isChartable}
          >
            Visualize
          </Button>
          <Button className="w-100 mb3" onClick={onSaveImageClick}>
            <Icon type="download" /> Save Chart Image
          </Button>
        </div>
      </Sidebar>
    )
  }
}

VisSidebar.propTypes = {
  isChartable: PropTypes.bool,
  onChartConfigurationFieldsChange: PropTypes.func,
  onChartTypeChange: PropTypes.func,
  onSaveImageClick: PropTypes.func,
  onVisualizeClick: PropTypes.func,
  query: PropTypes.object,
  queryResult: PropTypes.object
}

export default VisSidebar
