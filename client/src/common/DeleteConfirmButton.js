import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

const DeleteConfirmButton = React.forwardRef(
  ({ children, confirmMessage, onConfirm, className, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

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
          <Modal visible={setVisible} onClose={() => setVisible(false)}>
            {confirmMessage}
            <div>
              <Button
                onClick={() => {
                  setVisible(false);
                  onConfirm();
                }}
              >
                Delete
              </Button>
              <Button onClick={() => setVisible(false)}>Cancel</Button>
            </div>
          </Modal>
        )}
      </>
    );
  }
);

export default DeleteConfirmButton;
