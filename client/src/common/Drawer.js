import Drawer from 'antd/lib/drawer';
import React, { useEffect } from 'react';

function DrawerWrapper({
  title,
  visible,
  onClose,
  width,
  placement,
  children
}) {
  useEffect(() => {
    if (visible) {
      function handler(event) {
        if (event.code === 'Escape') {
          onClose();
          return false;
        }
      }
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [visible, onClose]);

  return (
    <Drawer
      title={title}
      visible={visible}
      width={width}
      destroyOnClose={true}
      onClose={onClose}
      placement={placement}
      bodyStyle={{
        height: 'calc(100vh - 55px)',
        overflow: 'auto'
      }}
    >
      {children}
    </Drawer>
  );
}

export default DrawerWrapper;
