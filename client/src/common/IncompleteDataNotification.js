import Icon from 'antd/lib/icon'
import Tooltip from 'antd/lib/tooltip'
import PropTypes from 'prop-types'
import React from 'react'

class IncompleteDataNotification extends React.Component {
  render() {
    const { incomplete } = this.props
    if (incomplete === true) {
      return (
        <Tooltip
          title="Return fewer rows or increase query result max rows in
        configuration."
        >
          <span className="red pointer mr2">
            <Icon className="mr2" type="warning" />
            Incomplete
          </span>
        </Tooltip>
      )
    }
    return null
  }
}

IncompleteDataNotification.propTypes = {
  incomplete: PropTypes.bool
}

export default IncompleteDataNotification
