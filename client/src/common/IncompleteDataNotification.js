import AlertIcon from 'mdi-react/AlertCircleIcon';
import Tooltip from 'antd/lib/tooltip';
import Typography from 'antd/lib/typography';
import React from 'react';

const { Text } = Typography;

function IncompleteDataNotification() {
  return (
    <Tooltip
      title="Return fewer rows or increase query result max rows in
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
