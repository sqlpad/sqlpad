import React from 'react';
import Drawer from '../common/Drawer';
import ServiceTokenList from './ServiceTokenList';

function ServiceTokenListDrawer({ visible, onClose }: any) {
  return (
    <Drawer
      title="Service Tokens"
      visible={visible}
      width={600}
      onClose={onClose}
      placement="left"
    >
      {/* @ts-expect-error ts-migrate(2322) FIXME: Property 'onClose' does not exist on type 'Intrins... Remove this comment to see the full error message */}
      <ServiceTokenList onClose={onClose} />
    </Drawer>
  );
}

export default ServiceTokenListDrawer;
