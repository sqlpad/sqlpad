import React from 'react';
import styles from './Text.module.css';

const Text = ({ children, className, type, ...rest }) => {
  const cs = [];

  if (className) {
    cs.push(className);
  }

  if (type === 'secondary') {
    cs.push(styles.secondary);
  } else if (type === 'danger') {
    cs.push(styles.danger);
  }

  return (
    <span className={cs.join(' ')} {...rest}>
      {children}
    </span>
  );
};

export default Text;
