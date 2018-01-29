import React from 'react'
import PropTypes from 'prop-types'

class SimpleTable extends React.Component {
  render() {
    const { renderHeader, renderBody, className } = this.props
    return (
      <div className={`pa4 ${className}`}>
        <div className="overflow-auto">
          <table className="w-100 center" cellSpacing="0">
            <thead>{renderHeader()}</thead>
            <tbody className="lh-copy">{renderBody()}</tbody>
          </table>
        </div>
      </div>
    )
  }
}

SimpleTable.propTypes = {
  className: PropTypes.string,
  renderHeader: PropTypes.func,
  renderBody: PropTypes.func
}

SimpleTable.defaultProps = {
  className: '',
  renderHeader: () => {},
  renderBody: () => {}
}

export default SimpleTable
