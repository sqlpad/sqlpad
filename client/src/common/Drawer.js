import React from 'react';
import { Dialog } from '@reach/dialog';
import '@reach/dialog/styles.css';

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
    position: 'absolute'
  };

  if (placement === 'right') {
    style.right = 0;
  }

  if (visible) {
    return (
      <Dialog onDismiss={onClose} style={style}>
        <div
          style={{
            fontSize: '1.5rem',
            borderBottom: '1px solid #d9d9d9',
            marginBottom: 16
          }}
        >
          {title}
        </div>
        {children}
      </Dialog>
    );
  }
  return null;
}

export default DrawerWrapper;
