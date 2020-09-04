import React from 'react';
import useSWR from 'swr';
import { connect } from 'unistore/react';
import Modal from '../../common/Modal';
import MultiSelect from '../../common/MultiSelect';
import { setQueryState } from '../../stores/queries';

function mapStateToProps(state: any) {
  return {
    tags: (state.query && state.query.tags) || [],
  };
}

const ConnectedQueryTagsModal = connect(mapStateToProps, { setQueryState })(
  React.memo(QueryTagsModal)
);

function QueryTagsModal({ tags, visible, onClose, setQueryState }: any) {
  const { data: tagsData } = useSWR(visible ? '/api/tags' : null);
  const options = (tagsData || []).map((tag: any) => ({
    name: tag,
    id: tag,
  }));
  const selectedItems = tags.map((tag: any) => ({
    name: tag,
    id: tag,
  }));

  const handleChange = (selectedItems: any) => {
    setQueryState(
      'tags',
      selectedItems.map((item: any) => item.name)
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
