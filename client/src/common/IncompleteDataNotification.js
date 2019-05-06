import AlertIcon from 'mdi-react/AlertCircleIcon';
import React from 'react';
import Tooltip from './Tooltip';
import Text from './Text';

function IncompleteDataNotification() {
  return (
    <Tooltip
      label="Return fewer rows or increase query result max rows in
        configuration."
    >
      <Text style={{ marginRight: '.5rem' }} type="danger">
        <AlertIcon style={{ marginRight: '.5rem' }} />
        Incomplete
      </Text>
    </Tooltip>
  );
}

export default IncompleteDataNotification;
