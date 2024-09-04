import React from 'react';
import styles from './Tag.module.css';
import CloseIcon from 'mdi-react/CloseIcon';

export interface Props extends React.HTMLProps<HTMLDivElement> {
  onClose?: () => void;
}

export type Ref = HTMLDivElement;

const Tag = React.forwardRef<Ref, Props>(
  ({ children, onClose, ...rest }, ref) => {
    return (
      <div ref={ref} className={styles.tagContainer} {...rest}>
        <span>{children}</span>
        {onClose && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={styles.tagCloseButton}
          >
            <CloseIcon size={14} className={styles.CloseIcon} />
          </span>
        )}
      </div>
    );
  }
);

export default Tag;
