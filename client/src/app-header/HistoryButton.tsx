import React, { useState } from 'react';
import Button from '../common/Button';
import QueryHistoryModal from '../queryHistory/QueryHistoryModal';
import useAppContext from '../utilities/use-app-context';

function HistoryButton() {
  const { currentUser } = useAppContext();
  const [showQueryHistory, setShowQueryHistory] = useState(false);

  if (!currentUser) {
    return null;
  }

  // If an editor has no identity (e.g., logged in without authentication), query history is not available because it can not be distinguished from others'.
  if (currentUser.id === 'noauth' && currentUser.role === 'editor') return;

  return (
    <div>
      <Button variant="ghost" onClick={() => setShowQueryHistory(true)}>
        History
      </Button>
      <QueryHistoryModal
        visible={showQueryHistory}
        onClose={() => setShowQueryHistory(false)}
      />
    </div>
  );
}

// @ts-expect-error ts-migrate(2769) FIXME: Type 'undefined' is not assignable to type 'ReactE... Remove this comment to see the full error message
export default React.memo(HistoryButton);
