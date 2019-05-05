import React from 'react';
import { Dialog } from '@reach/dialog';
import '@reach/dialog/styles.css';

function Modal({ title, visible, onClose, width, children }) {
  const style = {
    width
  };

  if (visible) {
    return (
      <Dialog onDismiss={onClose} style={style}>
        {title && (
          <div
            style={{
              fontSize: '1.5rem',
              borderBottom: '1px solid #d9d9d9',
              marginBottom: 16
            }}
          >
            {title}
          </div>
        )}
        {children}
      </Dialog>
    );
  }
  return null;
}

export default Modal;
