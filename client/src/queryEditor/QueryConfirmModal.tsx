import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import HSpacer from '../common/HSpacer';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Spacer from '../common/Spacer';
import Text from '../common/Text';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ErrorText({ error }: { error: string }) {
  if (!error) {
    return null;
  }
  return (
    <FormExplain>
      <Text type="danger">{error}</Text>
    </FormExplain>
  );
}

function QueryConfirmModal({ visible, onClose, onConfirm }: Props) {
  const initialRef = useRef(null);

  function handleCancel() {
    onClose();
  }

  const handleSave = () => {
    onConfirm();
  };

  return (
    <Modal
      title="Query Confirm"
      width={'500px'}
      visible={visible}
      onClose={handleCancel}
      initialFocusRef={initialRef}
    >
      <div>
        <form onSubmit={handleSave}>
          <label>
            You are operating on PROD environment, Deeb is watching you
          </label>
          <div
            style={{
              display: 'flex',
              marginTop: 16,
            }}
          >
            <Button
              htmlType="submit"
              style={{ width: '50%' }}
              variant="primary"
              onClick={handleSave}
            >
              Confirm
            </Button>
            <HSpacer />
            <Button style={{ width: '50%' }} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default QueryConfirmModal;
