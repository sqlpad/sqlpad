import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import SqlDiff from '../common/SqlDiff';
import { setQueryText } from '../stores/editor-actions';
import { useSessionQueryText } from '../stores/editor-store';
import {
  getLocalQueryText,
  removeLocalQueryText,
} from '../utilities/localQueryText';

function UnsavedQuerySelector({ queryId }: any) {
  const queryText = useSessionQueryText();
  const [showModal, setShowModal] = useState(false);
  const [unsavedQueryText, setUnsavedQueryText] = useState('');

  useEffect(() => {
    getLocalQueryText(queryId).then((localQueryText) => {
      if (typeof localQueryText === 'string' && localQueryText.trim() !== '') {
        setShowModal(true);
        setUnsavedQueryText(localQueryText);
      }
    });
  }, [queryId]);

  const value = [queryText, unsavedQueryText];
  return (
    <Modal title="Found unsaved query" visible={showModal} width="90vw">
      <div
        style={{ display: 'flex', margin: 8, justifyContent: 'space-around' }}
      >
        <Button
          onClick={() => {
            setShowModal(false);
          }}
        >
          Use saved
        </Button>
        <Button
          onClick={() => {
            setShowModal(false);
            removeLocalQueryText(queryId);
            setQueryText(unsavedQueryText);
          }}
        >
          Use unsaved
        </Button>
      </div>
      <div style={{ width: '100%', height: '60vh' }}>
        <SqlDiff key={JSON.stringify(value)} value={value} />
      </div>
    </Modal>
  );
}

export default UnsavedQuerySelector;
