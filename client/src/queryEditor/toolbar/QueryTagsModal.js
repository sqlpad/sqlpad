import React from 'react';
import useSWR from 'swr';
import { connect } from 'unistore/react';
import Modal from '../../common/Modal';
import MultiSelect from '../../common/MultiSelect';
import { setQueryState } from '../../stores/queries';

function mapStateToProps(state) {
  return {
    tags: (state.query && state.query.tags) || [],
  };
}

const ConnectedQueryTagsModal = connect(mapStateToProps, { setQueryState })(
  React.memo(QueryTagsModal)
);

function QueryTagsModal({ tags, visible, onClose, setQueryState }) {
  const { data: tagsData } = useSWR(visible ? '/api/tags' : null);
  const options = (tagsData || []).map((tag) => ({ name: tag, id: tag }));
  const selectedItems = tags.map((tag) => ({ name: tag, id: tag }));

  const handleChange = (selectedItems) => {
    setQueryState(
      'tags',
      selectedItems.map((item) => item.name)
    );
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
        options={options}
        onChange={handleChange}
      />
    </Modal>
  );
}

export default ConnectedQueryTagsModal;
