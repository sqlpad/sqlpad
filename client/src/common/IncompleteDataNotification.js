import AlertIcon from 'mdi-react/AlertCircleIcon';
import Typography from 'antd/lib/typography';
import React from 'react';
import Tooltip from './Tooltip';

const { Text } = Typography;

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
