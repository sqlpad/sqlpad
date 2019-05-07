import React, { useState, useCallback } from 'react';
import Drawer from '../../common/Drawer';
import Button from '../../common/Button';
import UserList from '../../users/UserList';
import Tooltip from '../../common/Tooltip';

function ConfigButton() {
  const [visible, setVisible] = useState(false);

  const onClick = useCallback(() => setVisible(true), []);
  const onClose = useCallback(() => setVisible(false), []);

  return (
    <>
      <Tooltip label="Users">
        <Button onClick={onClick}>Users</Button>
      </Tooltip>

      <Drawer
        title={'Users'}
        visible={visible}
        width={600}
        onClose={onClose}
        placement={'right'}
      >
        <UserList />
      </Drawer>
    </>
  );
}

export default React.memo(ConfigButton);
