import { Dialog } from '@reach/dialog';
import React, { useRef, useState } from 'react';
import base from './base.module.css';
import Button from './Button';

const dialogStyle = {
  width: '500px',
  borderRadius: '2px'
};

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
            className={base.shadow2}
            style={dialogStyle}
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
