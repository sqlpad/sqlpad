import React from 'react';
import styles from './Input.module.css';

export interface Props extends React.HTMLProps<HTMLInputElement> {
  error?: boolean;
  className?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export default function Input({ children, error, className, ...rest }: Props) {
  const classNames = [styles.input];

  if (error) {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <input className={classNames.join(' ')} {...rest}>
      {children}
    </input>
  );
}
