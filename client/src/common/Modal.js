import { Dialog } from '@reach/dialog';
import '@reach/dialog/styles.css';
import CloseIcon from 'mdi-react/CloseIcon';
import React from 'react';
import Button from './Button';

function Modal({ title, visible, onClose, width, children }) {
  const style = {
    width
  };

  if (visible) {
    return (
      <Dialog onDismiss={onClose} style={style}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.5rem',
            borderBottom: '1px solid #d9d9d9',
            marginBottom: 16
          }}
        >
          <span>{title}</span>
          <Button icon={<CloseIcon />} onClick={onClose} />
        </div>

        {children}
      </Dialog>
    );
  }
  return null;
}

export default Modal;
