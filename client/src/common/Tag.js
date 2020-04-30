import React from 'react';
import styles from './Tag.module.css';
import CloseIcon from 'mdi-react/CloseIcon';

function Tag({ children, onClose }) {
  return (
    <div className={styles.tagContainer}>
      <span>{children}</span>
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={styles.tagCloseButton}
        >
          <CloseIcon size={14} className={styles.CloseIcon} />
        </button>
      )}
    </div>
  );
}

export default Tag;
