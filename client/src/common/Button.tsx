import React from 'react';
import styles from './Button.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 18;

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: any;
  variant?: string;
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  tooltip?: string;
}

export type Ref = HTMLButtonElement;

const Button = React.forwardRef<Ref, Props>(
  (
    {
      children,
      icon,
      variant,
      htmlType,
      tooltip,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    const classNames = [styles.btn];

    if (variant === 'primary') {
      classNames.push(styles.primary);
    } else if (variant === 'danger') {
      classNames.push(styles.danger);
    } else if (variant === 'ghost') {
      classNames.push(styles.ghost);
    }

    if (className) {
      classNames.push(className);
    }

    const b = (
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
      return b;
    }

    return <Tooltip label={tooltip}>{b}</Tooltip>;
  }
);

export default Button;
