import React from 'react';
import styles from './Button.module.css';
import Tooltip from './Tooltip';

const Button = ({
  children,
  type,
  htmlType,
  tooltip,
  disabled,
  className,
  ...rest
}) => {
  const classNames = [styles.btn];

  if (type === 'primary') {
    classNames.push(styles.primary);
  } else if (type === 'danger') {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  const button = (
    <button
      className={classNames.join(' ')}
      type={htmlType}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );

  // If the button is disabled the tooltip gets weird on hover
  if (!tooltip || disabled) {
    return button;
  }

  return <Tooltip label={tooltip}>{button}</Tooltip>;
};

export default Button;
