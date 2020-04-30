import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import QueryHistoryModal from '../queryHistory/QueryHistoryModal';
import { clearQueries } from '../stores/queries';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
  };
}

const Connected = connect(mapStateToProps, (store) => ({
  clearQueries,
}))(React.memo(HistoryButton));

function HistoryButton({ currentUser, clearQueries }) {
  const [showQueryHistory, setShowQueryHistory] = useState(false);

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

export default Connected;
