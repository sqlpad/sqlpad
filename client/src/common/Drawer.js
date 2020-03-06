import { Dialog } from '@reach/dialog';
import CloseIcon from 'mdi-react/CloseIcon';
import React from 'react';
import styles from './Drawer.module.css';
import IconButton from './IconButton';

function Drawer({ title, visible, onClose, width, placement, children }) {
  const style = {
    width
  };

  if (placement === 'right') {
    style.right = 0;
  }

  if (visible) {
    return (
      <Dialog
        aria-label={title}
        onDismiss={onClose}
        className={styles.Dialog}
        style={style}
      >
        <div className={styles.titleWrapper}>
          {title}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className={styles.dialogBody}>{children}</div>
      </Dialog>
    );
  }
  return null;
}

export default Drawer;
