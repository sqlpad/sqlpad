import { Dialog } from '@reach/dialog';
import React from 'react';
import base from './base.module.css';

function DrawerWrapper({
  title,
  visible,
  onClose,
  width,
  placement,
  children
}) {
  const style = {
    height: '100vh',
    margin: '0',
    overflow: 'auto',
    width,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column'
  };

  if (placement === 'right') {
    style.right = 0;
  }

  if (visible) {
    return (
      <Dialog onDismiss={onClose} className={base.shadow2} style={style}>
        <div
          className={base.borderBottom}
          style={{
            fontSize: '1.5rem',
            marginBottom: 16
          }}
        >
          {title}
        </div>
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {children}
        </div>
      </Dialog>
    );
  }
  return null;
}

export default DrawerWrapper;
