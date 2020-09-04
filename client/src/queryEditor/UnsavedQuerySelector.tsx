import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import SqlDiff from '../common/SqlDiff';
import { setQueryState } from '../stores/queries';
import {
  getLocalQueryText,
  removeLocalQueryText,
} from '../utilities/localQueryText';

function UnsavedQuerySelector({ queryId, queryText, setQueryState }: any) {
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
            setQueryState('queryText', unsavedQueryText);
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

function mapStateToProps(state: any, props: any) {
  return {
    queryText: state.query && state.query.queryText,
  };
}

const Connected = connect(mapStateToProps, { setQueryState })(
  UnsavedQuerySelector
);

export default Connected;
