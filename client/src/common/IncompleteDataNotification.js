import AlertIcon from 'mdi-react/AlertIcon';
import React from 'react';
import Text from './Text';
import Tooltip from './Tooltip';
import styles from './IncompleteDataNotification.module.css';

function IncompleteDataNotification() {
  return (
    <Tooltip
      label="Return fewer rows or increase query result max rows in
        configuration."
    >
      {/* span use in place of wrapping Text with forwardRef needed by Tooltip */}
      <span>
        <Text className={styles.text} type="danger">
          <AlertIcon size={18} className={styles.AlertIcon} />
          Incomplete
        </Text>
      </span>
    </Tooltip>
  );
}

export default IncompleteDataNotification;
