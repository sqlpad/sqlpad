import { Dialog } from '@reach/dialog';
import CloseIcon from 'mdi-react/CloseIcon';
import React from 'react';
import base from './base.module.css';
import Button from './Button';

function Modal({ title, visible, onClose, width, children }) {
  if (visible) {
    return (
      <Dialog
        onDismiss={onClose}
        className={base.shadow2}
        style={{
          width
        }}
      >
        <div
          className={base.borderBottom}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.5rem',
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
