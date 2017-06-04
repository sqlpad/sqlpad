import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

class ConnectionListRow extends React.Component {
  constructor (props) {
    super(props)
    this.onDelete = this.onDelete.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  onDelete (e) {
    this.props.handleDelete(this.props.connection)
  }

  onSelect (e) {
    this.props.handleSelect(this.props.connection)
  }

  render () {
    var getClassNames = () => {
      if (this.props.selectedConnection && this.props.selectedConnection._id === this.props.connection._id) {
        return 'list-group-item ListRow ListRowSelected'
      } else {
        return 'list-group-item ListRow'
      }
    }
    const popoverClick = (
      <Popover id='popover-trigger-click' title='Are you sure?'>
        <Button bsStyle='danger' onClick={this.onDelete} style={{width: '100%'}}>delete</Button>
      </Popover>
    )
    return (
      <li className={getClassNames()}>
        <h4><a href='#connection' onClick={this.onSelect}>{this.props.connection.name}</a></h4>
        <h5>{this.props.connection.driver} {this.props.connection.host}/{this.props.connection.database}</h5>
        <OverlayTrigger trigger='click' placement='left' container={this} rootClose overlay={popoverClick}>
          <a className='ListRowDeleteButton' href='#delete'><Glyphicon glyph='trash' /></a>
        </OverlayTrigger>
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
