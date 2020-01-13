import React from 'react';
import Modal from '../common/Modal';
import QueryHistoryContent from './QueryHistoryContent';

function QueryHistoryModal({ visible, onClose }) {
  return (
    <Modal
      width="90%"
      title="Query History"
      visible={visible}
      onClose={onClose}
    >
      <QueryHistoryContent />
    </Modal>
  );
}

export default QueryHistoryModal;
