import React from 'react';
import styles from './TextArea.module.css';

export interface Props extends React.HTMLProps<HTMLTextAreaElement> {
  error?: boolean;
}

export default function TextArea({
  children,
  error,
  className,
  ...rest
}: Props) {
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
