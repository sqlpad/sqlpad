import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import chartDefinitions from '../utilities/chartDefinitions'
import SqlEditor from '../common/SqlEditor'

class QueryPreview extends React.Component {
  render() {
    const { config, selectedQuery } = this.props
    if (selectedQuery) {
      const query = selectedQuery
      const chartTypeLabel = () => {
        const chartType =
          query.chartConfiguration && query.chartConfiguration.chartType
            ? query.chartConfiguration.chartType
            : null

        const chartDefinition = chartDefinitions.find(
          def => def.chartType === chartType
        )
        return chartDefinition ? (
          <span className="f3">Chart: {chartDefinition.chartLabel}</span>
        ) : null
      }
      return (
        <div className="pa2 w-40 flex flex-column">
          <ControlLabel>Preview</ControlLabel>
          <span className="f2">{selectedQuery.name}</span>
          <SqlEditor config={config} readOnly value={selectedQuery.queryText} />
          {chartTypeLabel()}
          <span className="f3">
            Modified: {moment(query.modifiedDate).calendar()}
          </span>
          <span className="f3">Created By: {query.createdBy}</span>
        </div>
      )
    } else {
      return <div className="pa2 w-40" />
    }
  }
}

QueryPreview.propTypes = {
  config: PropTypes.object.isRequired,
  selectedQuery: PropTypes.object
}

QueryPreview.defaultProps = {
  selectedQuery: {}
}

export default QueryPreview
