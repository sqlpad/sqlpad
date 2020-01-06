import React from 'react';
import styles from './TextArea.module.css';

export default function TextArea({ children, error, className, ...rest }) {
  const classNames = [styles.textarea];

  if (error) {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <textarea className={classNames.join(' ')} {...rest}>
      {children}
    </textarea>
  );
}
