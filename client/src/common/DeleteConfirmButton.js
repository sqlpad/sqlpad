import { Dialog } from '@reach/dialog';
import '@reach/dialog/styles.css';
import React, { useState, useRef } from 'react';
import Button from './Button';

const DeleteConfirmButton = React.forwardRef(
  ({ children, confirmMessage, onConfirm, className, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const cancelEl = useRef(null);

    return (
      <>
        <Button
          onClick={() => setVisible(true)}
          ref={ref}
          type="danger"
          {...rest}
        >
          {children}
        </Button>
        {visible && (
          <Dialog
            onDismiss={() => setVisible(false)}
            style={{ width: '500px' }}
            initialFocusRef={cancelEl}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.5rem',
                marginBottom: 16
              }}
            >
              <span>{confirmMessage}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                type="danger"
                style={{ width: 200 }}
                onClick={() => {
                  setVisible(false);
                  onConfirm();
                }}
              >
                Delete
              </Button>
              <Button
                ref={cancelEl}
                style={{ width: 200 }}
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
