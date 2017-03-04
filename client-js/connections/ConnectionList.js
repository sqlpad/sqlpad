var React = require('react')
var ControlLabel = require('react-bootstrap/lib/ControlLabel')
var Button = require('react-bootstrap/lib/Button')
var ListGroup = require('react-bootstrap/lib/ListGroup')
const ConnectionListRow = require('./ConnectionListRow')

const connectionListStyle = {
  position: 'absolute',
  left: 0,
  width: '50%',
  top: 0,
  bottom: 0,
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class ConnectionList extends React.Component {
  render () {
    const { connections, selectedConnection, handleSelect, handleDelete, onNewConnectionClick } = this.props
    var listRows = connections.map((connection) => {
      return (
        <ConnectionListRow
          key={connection._id}
          connection={connection}
          selectedConnection={selectedConnection}
          handleSelect={handleSelect}
          handleDelete={handleDelete} />
      )
    })
    return (
      <div className='ConnectionList' style={connectionListStyle}>
        <ControlLabel>Connections</ControlLabel>
        <ListGroup className='ConnectionListContents'>
          {listRows}
        </ListGroup>
        <Button onClick={onNewConnectionClick}>
          New Connection
        </Button>
      </div>
    )
  }
}

ConnectionList.propTypes = {
  connections: React.PropTypes.array.isRequired,
  selectedConnection: React.PropTypes.object,
  handleSelect: React.PropTypes.func.isRequired,
  handleDelete: React.PropTypes.func.isRequired,
  onNewConnectionClick: React.PropTypes.func.isRequired
}

module.exports = ConnectionList
