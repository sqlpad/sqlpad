import React from 'react'
import PropTypes from 'prop-types'
import DeleteButton from '../common/DeleteButton'

class ConnectionListRow extends React.Component {
  handleDeleteClick = e => {
    const { handleDelete, connection } = this.props
    handleDelete(connection)
  }

  handleConnectionClick = e => {
    const { handleSelect, connection } = this.props
    handleSelect(connection)
  }

  render() {
    const { connection, selectedConnection } = this.props

    const classNames =
      selectedConnection && selectedConnection._id === connection._id
        ? 'list-group-item ListRow ListRowSelected'
        : 'list-group-item ListRow'

    return (
      <li className={classNames}>
        <h4>
          <a href="#connection" onClick={this.handleConnectionClick}>
            {connection.name}
          </a>
        </h4>
        <h5>
          {connection.driver} {connection.host}/{connection.database}
        </h5>
        <DeleteButton onClick={this.handleDeleteClick} />
      </li>
    )
  }
}

ConnectionListRow.propTypes = {
  handleDelete: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  selectedConnection: PropTypes.object,
  connection: PropTypes.object.isRequired
}

ConnectionListRow.defaultProps = {
  selectedConnection: {}
}

export default ConnectionListRow
