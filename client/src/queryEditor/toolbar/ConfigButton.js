import Button from 'antd/lib/button';
import Tabs from 'antd/lib/tabs';
import Tooltip from 'antd/lib/tooltip';
import React, { useState, useCallback } from 'react';
import Drawer from '../../common/Drawer';
import ConfigurationForm from '../../configuration/ConfigurationForm';
import UserList from '../../users/UserList';
import ConnectionList from '../../connections/ConnectionList';

const TabPane = Tabs.TabPane;

function ConfigButton() {
  const [showConfig, setShowConfig] = useState(false);

  const onClick = useCallback(() => setShowConfig(true), []);
  const onClose = useCallback(() => setShowConfig(false), []);

  return (
    <>
      <Tooltip placement="bottom" title="Configuration">
        <Button type="ghost" icon="setting" onClick={onClick} />
      </Tooltip>

      <Drawer
        title={'Configuration'}
        visible={showConfig}
        width={600}
        onClose={onClose}
        placement={'right'}
      >
        <Tabs defaultActiveKey="1" onChange={e => console.log(e)}>
          <TabPane tab="Configuration" key="1">
            <ConfigurationForm onClose={() => {}} />
          </TabPane>
          <TabPane tab="Users" key="2">
            <UserList />
          </TabPane>
          <TabPane tab="Connections" key="3">
            <ConnectionList />
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
}

export default React.memo(ConfigButton);
