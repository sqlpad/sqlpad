import React from 'react'
import PropTypes from 'prop-types'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import ConnectionListRow from './ConnectionListRow'

const connectionListStyle = {
  flexBasis: '50%',
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class ConnectionList extends React.Component {
  render() {
    const {
      connections,
      selectedConnection,
      handleSelect,
      handleDelete,
      onNewConnectionClick
    } = this.props
    const listRows = connections.map(connection => {
      return (
        <ConnectionListRow
          key={connection._id}
          connection={connection}
          selectedConnection={selectedConnection}
          handleSelect={handleSelect}
          handleDelete={handleDelete}
        />
      )
    })
    return (
      <div className="ConnectionList" style={connectionListStyle}>
        <ControlLabel>Connections</ControlLabel>
        <ListGroup className="ConnectionListContents">{listRows}</ListGroup>
        <Button onClick={onNewConnectionClick}>New Connection</Button>
      </div>
    )
  }
}

ConnectionList.propTypes = {
  connections: PropTypes.array.isRequired,
  selectedConnection: PropTypes.object,
  handleSelect: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  onNewConnectionClick: PropTypes.func.isRequired
}

export default ConnectionList
