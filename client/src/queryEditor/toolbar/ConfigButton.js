import React, { useState, useCallback } from 'react';
import Drawer from '../../common/Drawer';
import Button from '../../common/Button';
import ConfigurationForm from '../../configuration/ConfigurationForm';
import Tooltip from '../../common/Tooltip';

function ConfigButton() {
  const [showConfig, setShowConfig] = useState(false);

  const onClick = useCallback(() => setShowConfig(true), []);
  const onClose = useCallback(() => setShowConfig(false), []);

  return (
    <>
      <Tooltip label="Configuration">
        <Button onClick={onClick}>Config</Button>
      </Tooltip>

      <Drawer
        title={'Configuration'}
        visible={showConfig}
        width={600}
        onClose={onClose}
        placement={'right'}
      >
        <ConfigurationForm onClose={onClose} />
      </Drawer>
    </>
  );
}

export default React.memo(ConfigButton);
