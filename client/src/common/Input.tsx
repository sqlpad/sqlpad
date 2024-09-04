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

export type Ref = HTMLInputElement | null;

const Input = React.forwardRef<Ref, Props>((props, ref) => {
  const { children, error, className, ...rest } = props;
  const classNames = [styles.input];

  if (error) {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <input ref={ref} className={classNames.join(' ')} {...rest}>
      {children}
    </input>
  );
});

export default Input;
