import { Dialog } from '@reach/dialog';
import React from 'react';
import styles from './Drawer.module.css';

function Drawer({ title, visible, onClose, width, placement, children }) {
  const style = {
    width
  };

  if (placement === 'right') {
    style.right = 0;
  }

  if (visible) {
    return (
      <Dialog onDismiss={onClose} className={styles.Dialog} style={style}>
        <div className={styles.titleWrapper}>{title}</div>
        <div className={styles.dialogBody}>{children}</div>
      </Dialog>
    );
  }
  return null;
}

export default Drawer;
