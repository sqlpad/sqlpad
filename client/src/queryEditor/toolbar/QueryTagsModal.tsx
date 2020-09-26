import React from 'react';
import useSWR from 'swr';
import Modal from '../../common/Modal';
import MultiSelect from '../../common/MultiSelect';
import { setQueryState } from '../../stores/editor-actions';
import { useEditorStore } from '../../stores/editor-store';

function QueryTagsModal({ visible, onClose }: any) {
  const tags = useEditorStore((s) => s?.query?.tags || []);

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

export default React.memo(QueryTagsModal);
