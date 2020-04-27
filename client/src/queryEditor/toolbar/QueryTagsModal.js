import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { setQueryState } from '../../stores/queries';
import Modal from '../../common/Modal';
import MultiSelect from '../../common/MultiSelect';
import fetchJson from '../../utilities/fetch-json';

function mapStateToProps(state) {
  return {
    tags: (state.query && state.query.tags) || []
  };
}

const ConnectedQueryTagsModal = connect(mapStateToProps, { setQueryState })(
  React.memo(QueryTagsModal)
);

function QueryTagsModal({ tags, visible, onClose, setQueryState }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchJson('GET', '/api/tags').then(response => {
        const { data } = response;
        if (data) {
          const options = data.map(tag => ({ name: tag, id: tag }));
          setOptions(options);
        }
      });
    }
  }, [visible]);

  const selectedItems = tags.map(tag => ({ name: tag, id: tag }));

  const handleChange = selectedItems => {
    setQueryState(
      'tags',
      selectedItems.map(item => item.name)
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
