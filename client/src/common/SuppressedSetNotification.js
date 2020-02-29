import React from 'react';
import DataNotification from './DataNotification';

function SuppressedSetNotification() {
  return (
    <DataNotification tooltip="Multiple statements ran, but only last result is shown">
      Showing last result
    </DataNotification>
  );
}

export default SuppressedSetNotification;
