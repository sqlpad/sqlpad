import AlertIcon from 'mdi-react/AlertCircleIcon';
import React from 'react';
import Text from './Text';
import Tooltip from './Tooltip';

function IncompleteDataNotification() {
  return (
    <Tooltip
      label="Return fewer rows or increase query result max rows in
        configuration."
    >
      {/* span use in place of wrapping Text with forwardRef needed by Tooltip */}
      <span>
        <Text style={{ marginRight: '.5rem' }} type="danger">
          <AlertIcon style={{ marginRight: '.5rem' }} />
          Incomplete
        </Text>
      </span>
    </Tooltip>
  );
}

export default IncompleteDataNotification;
