import React from 'react';
import styles from './Tag.module.css';
import CloseIcon from 'mdi-react/CloseIcon';

function Tag({ children, onClose }) {
  return (
    <div className={styles.tagContainer}>
      <span>{children}</span>
      {onClose && (
        <>
          <span style={{ width: 6 }} />
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className={styles.tagCloseButton}
          >
            <CloseIcon size={14} style={{ marginTop: 2 }} />
          </button>
        </>
      )}
    </div>
  );
}

export default Tag;
