import React from 'react';
import Drawer from '../common/Drawer.tsx';
import ServiceTokenList from './ServiceTokenList';

function ServiceTokenListDrawer({ visible, onClose }) {
  return (
    <Drawer
      title="Service Tokens"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      <ServiceTokenList onClose={onClose} />
    </Drawer>
  );
}

export default ServiceTokenListDrawer;
