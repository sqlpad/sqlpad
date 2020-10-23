import React from 'react';
import Modal from '../../common/Modal';
import MultiSelect, { MultiSelectItem } from '../../common/MultiSelect';
import { setTags } from '../../stores/editor-actions';
import { useSessionTags } from '../../stores/editor-store';
import { api } from '../../utilities/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function QueryTagsModal({ visible, onClose }: Props) {
  const tags = useSessionTags();

  const { data: tagsData } = api.useTags(visible);
  const options = (tagsData || []).map((tag) => ({
    name: tag,
    id: tag,
  }));
  const selectedItems = tags.map((tag) => ({
    name: tag,
    id: tag,
  }));

  const handleChange = (selectedItems: MultiSelectItem[]) => {
    const tags = selectedItems
      .map((item) => item.name || '')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    setTags(tags);
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
