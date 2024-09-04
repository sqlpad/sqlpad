import React from 'react';
import DataNotification from './DataNotification';

function IncompleteDataNotification() {
  return (
    <DataNotification
      tooltip="Return fewer rows or increase query result max rows in
    configuration. If max rows has not been exceeded, return fewer columns."
    >
      Incomplete
    </DataNotification>
  );
}

export default IncompleteDataNotification;
