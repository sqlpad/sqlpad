import React from 'react';
import styles from './Button.module.css';

const Button = React.forwardRef(
  ({ children, type, htmlType, className, ...rest }, ref) => {
    const classNames = [styles.btn];

    if (type === 'primary') {
      classNames.push(styles.primary);
    } else if (type === 'danger') {
      classNames.push(styles.danger);
    }

    if (className) {
      classNames.push(className);
    }

    return (
      <button
        ref={ref}
        className={classNames.join(' ')}
        type={htmlType}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export default Button;
