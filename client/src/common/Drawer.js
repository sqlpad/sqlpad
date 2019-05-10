import React from 'react';
import { Dialog } from '@reach/dialog';

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
    boxShadow: `rgba(56, 165, 255, 0.44) 0px 0px 8px 4px, rgba(209, 63, 255, 0.28) 4px 0px 18px 14px`
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
