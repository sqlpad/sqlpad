import React from 'react'
import PropTypes from 'prop-types'
import { Creatable } from 'react-select'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Modal from 'react-bootstrap/lib/Modal'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

class QueryDetailsModal extends React.Component {
  input = undefined

  onSubmit = e => {
    e.preventDefault()
    this.close()
  }

  onQueryNameChange = e => {
    this.props.onQueryNameChange(e.target.value)
  }

  onEntered = () => {
    if (this.input) this.input.focus()
  }

  renderNavLink = (href, text) => {
    const { query } = this.props
    const saved = !!query._id
    if (saved) {
      return (
        <li role="presentation">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {text} <Glyphicon glyph="new-window" />
          </a>
        </li>
      )
    } else {
      const tooltip = (
        <Tooltip id="tooltip">
          Save query to enable table/chart view links
        </Tooltip>
      )
      return (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <li role="presentation" className="disabled">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.preventDefault()}
            >
              {text} <Glyphicon glyph="new-window" />
            </a>
          </li>
        </OverlayTrigger>
      )
    }
  }

  render() {
    const {
      onHide,
      onQueryTagsChange,
      query,
      showModal,
      tagOptions
    } = this.props
    return (
      <Modal
        animation
        onEntered={this.onEntered}
        onHide={onHide}
        show={showModal}
      >
        <Modal.Header closeButton />
        <Modal.Body>
          <form onSubmit={this.onSubmit}>
            <FormGroup>
              <ControlLabel>Query Tags</ControlLabel>
              <Creatable
                multi
                name="query-tags-field"
                onChange={onQueryTagsChange}
                options={tagOptions}
                placeholder=""
                value={query.tags}
              />
            </FormGroup>
            <br />
            <ul className="nav nav-pills nav-justified">
              {this.renderNavLink('?format=table', 'Link to Table')}
              {this.renderNavLink('?format=chart', 'Link to Chart')}
            </ul>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

QueryDetailsModal.propTypes = {
  onHide: PropTypes.func.isRequired,
  onQueryTagsChange: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  showModal: PropTypes.bool.isRequired,
  tagOptions: PropTypes.array
}

QueryDetailsModal.defaultProps = {
  tagOptions: []
}

export default QueryDetailsModal
