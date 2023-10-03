import { Dialog } from '@reach/dialog';
import CloseIcon from 'mdi-react/CloseIcon';
import React from 'react';
import styles from './Drawer.module.css';
import IconButton from './IconButton';

export interface Props extends React.HTMLAttributes<HTMLElement> {
  title: string;
  visible?: boolean;
  placement: 'right' | 'left';
  width: number | string;
  onClose: () => void;
}

function Drawer({
  title,
  visible,
  onClose,
  width,
  placement,
  children,
}: Props) {
  const style: React.CSSProperties = {
    width,
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
