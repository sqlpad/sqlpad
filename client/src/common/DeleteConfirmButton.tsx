import { Dialog } from '@reach/dialog';
import DeleteIcon from 'mdi-react/DeleteIcon';
import React, { useRef, useState } from 'react';
import Button from './Button';
import styles from './DeleteConfirmButton.module.css';
import IconButton from './IconButton';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onConfirm: () => void;
  confirmMessage: string;
  icon?: boolean;
}

export type Ref = HTMLButtonElement;

const DeleteConfirmButton = React.forwardRef<Ref, ButtonProps>(
  (
    {
      children,
      confirmMessage,
      onConfirm,
      className,
      icon,
      ...rest
    }: ButtonProps,
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const cancelEl = useRef(null);

    return (
      <>
        {icon ? (
          <IconButton
            onClick={() => setVisible(true)}
            ref={ref}
            variant="danger"
            {...rest}
          >
            <DeleteIcon />
          </IconButton>
        ) : (
          <Button
            onClick={() => setVisible(true)}
            ref={ref}
            variant="danger"
            {...rest}
          >
            {children}
          </Button>
        )}
        {visible && (
          <Dialog
            aria-label={confirmMessage}
            onDismiss={() => setVisible(false)}
            className={styles.Dialog}
            initialFocusRef={cancelEl}
          >
            <div className={styles.dialogContent}>
              <span>{confirmMessage}</span>
            </div>
            <div className={styles.buttonWrapper}>
              <Button
                variant="danger"
                className={styles.button}
                onClick={() => {
                  setVisible(false);
                  onConfirm();
                }}
              >
                Delete
              </Button>
              <Button
                ref={cancelEl}
                className={styles.button}
                onClick={() => setVisible(false)}
              >
                Cancel
              </Button>
            </div>
          </Dialog>
        )}
      </>
    );
  }
);

export default DeleteConfirmButton;
