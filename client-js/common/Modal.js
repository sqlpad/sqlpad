import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-bootstrap/lib/Modal'

class MyModal extends React.Component {
  render() {
    const {
      className,
      onHide,
      renderBody,
      renderFooter,
      show,
      title
    } = this.props
    return (
      <Modal className={className} show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderBody()}</Modal.Body>
        {renderFooter && <Modal.Footer>{renderFooter()}</Modal.Footer>}
      </Modal>
    )
  }
}

MyModal.propTypes = {
  className: PropTypes.string,
  onHide: PropTypes.func,
  renderBody: PropTypes.func,
  renderFooter: PropTypes.func,
  show: PropTypes.bool,
  title: PropTypes.string
}

MyModal.defaultProps = {
  className: '',
  onHide: () => {},
  renderBody: () => {},
  show: false,
  title: ''
}

export default MyModal
