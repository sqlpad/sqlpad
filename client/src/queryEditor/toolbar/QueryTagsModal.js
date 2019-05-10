import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

function mapStateToProps(state) {
  return {
    queryId: state.query && state.query._id
  };
}

const ConnectedQueryTagsModal = connect(
  mapStateToProps,
  actions
)(React.memo(QueryTagsModal));

function QueryTagsModal({ queryId, visible, onClose }) {
  return (
    <Modal
      title="Query tags"
      width={'600px'}
      visible={visible}
      onClose={onClose}
    >
      <div>TODO add tag input for queryId {queryId}</div>
      <Button type="primary" onClick={onClose}>
        OK
      </Button>
    </Modal>
  );
}

export default ConnectedQueryTagsModal;
