import Icon from 'antd/lib/icon';
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
        <Icon style={{ marginRight: '.5rem' }} type="warning" />
        Incomplete
      </Text>
    </Tooltip>
  );
}

export default IncompleteDataNotification;
