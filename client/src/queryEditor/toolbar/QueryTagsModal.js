import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import MultiSelect from '../../common/MultiSelect';
import Spacer from '../../common/Spacer';

function mapStateToProps(state) {
  return {
    availableTags: state.availableTags || [],
    tags: (state.query && state.query.tags) || []
  };
}

const ConnectedQueryTagsModal = connect(
  mapStateToProps,
  actions
)(React.memo(QueryTagsModal));

function QueryTagsModal({
  availableTags,
  tags,
  visible,
  onClose,
  setQueryState
}) {
  const selectedItems = tags.map(tag => ({ name: tag, id: tag }));

  const handleChange = selectedItems => {
    setQueryState('tags', selectedItems.map(item => item.name));
  };

  return (
    <Modal
      title="Query tags"
      width={'600px'}
      visible={visible}
      onClose={onClose}
    >
      <MultiSelect
        selectedItems={selectedItems}
        options={availableTags.map(tag => ({ name: tag, id: tag }))}
        onChange={handleChange}
      />
      {/* <Spacer />
      <Button type="primary" onClick={onClose}>
        OK
      </Button> */}
    </Modal>
  );
}

export default ConnectedQueryTagsModal;
