import React from 'react';
import styles from './Button.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 18;

const Button = React.forwardRef(
  (
    { children, icon, type, htmlType, tooltip, disabled, className, ...rest },
    ref
  ) => {
    const classNames = [styles.btn];

    if (type === 'primary') {
      classNames.push(styles.primary);
    } else if (type === 'danger') {
      classNames.push(styles.danger);
    }

    if (className) {
      classNames.push(className);
    }

    // TODO change type prop to variant, htmlType to type
    const button = (
      <button
        ref={ref}
        className={classNames.join(' ')}
        type={htmlType}
        disabled={disabled}
        {...rest}
      >
        {icon && React.cloneElement(icon, { size: ICON_SIZE }, null)}
        {children && icon && <span style={{ width: 4 }} />}
        {children}
      </button>
    );

    // If the button is disabled the tooltip gets weird on hover
    if (!tooltip || disabled) {
      return button;
    }

    return <Tooltip label={tooltip}>{button}</Tooltip>;
  }
);

export default Button;
