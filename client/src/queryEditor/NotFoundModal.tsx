import React from 'react';
import ButtonLink from '../common/ButtonLink';
import Modal from '../common/Modal';
import { resetNewQuery } from '../stores/editor-actions';

export interface Props {
  visible: boolean;
  queryId: string;
}

function NotFoundModal({ visible, queryId }: Props) {
  return (
    <Modal title="Query not found" width={'400px'} visible={visible}>
      <p>
        Query ID <code>{queryId}</code> not found. It may have been deleted or
        you may not have access.
      </p>
      <ButtonLink
        style={{ width: '100%', justifyContent: 'center' }}
        variant="primary"
        to="/queries/new"
        onClick={() => resetNewQuery()}
      >
        Start new query
      </ButtonLink>
    </Modal>
  );
}

export default React.memo(NotFoundModal);
