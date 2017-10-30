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
          <h4>Chart: {chartDefinition.chartLabel}</h4>
        ) : null
      }
      return (
        <div className="QueryPreview">
          <ControlLabel>Preview</ControlLabel>
          <h4>{selectedQuery.name}</h4>
          <SqlEditor
            config={config}
            height="70%"
            readOnly
            value={selectedQuery.queryText}
          />
          {chartTypeLabel()}
          <h4>Modified: {moment(query.modifiedDate).calendar()}</h4>
          <h4>Created By: {query.createdBy}</h4>
        </div>
      )
    } else {
      return <div className="QueryPreview" />
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
