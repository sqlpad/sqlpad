import React, { useState, useCallback } from 'react';
import Drawer from '../../common/Drawer';
import Button from '../../common/Button';
import ConfigurationForm from '../../configuration/ConfigurationForm';

function ConfigButton() {
  const [showConfig, setShowConfig] = useState(false);

  const onClick = useCallback(() => setShowConfig(true), []);
  const onClose = useCallback(() => setShowConfig(false), []);

  return (
    <>
      <Button tooltip="Configuration" onClick={onClick}>
        Config
      </Button>

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
