import { Dialog } from '@reach/dialog';
import CloseIcon from 'mdi-react/CloseIcon';
import React from 'react';
import styles from './Modal.module.css';
import IconButton from './IconButton';

function Modal({ title, visible, onClose, width, children }) {
  if (visible) {
    return (
      <Dialog
        onDismiss={onClose}
        className={styles.Dialog}
        style={{
          width
        }}
      >
        <div className={styles.titleWrapper}>
          <span>{title}</span>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {children}
      </Dialog>
    );
  }
  return null;
}

export default Modal;
