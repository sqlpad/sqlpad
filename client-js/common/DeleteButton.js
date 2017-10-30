import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import './DeleteButton.css'

class DeleteButton extends React.Component {
  render() {
    const { onClick } = this.props
    const popoverClick = (
      <Popover id="popover-trigger-click" title="Are you sure?">
        <Button bsStyle="danger" onClick={onClick} style={{ width: '100%' }}>
          delete
        </Button>
      </Popover>
    )
    return (
      <OverlayTrigger
        trigger="click"
        placement="left"
        rootClose
        overlay={popoverClick}
      >
        <a className="DeleteButton" href="#delete">
          <Glyphicon glyph="trash" />
        </a>
      </OverlayTrigger>
    )
  }
}

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default DeleteButton
