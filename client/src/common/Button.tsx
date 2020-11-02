import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import React, { ReactNode } from 'react';
import styles from './Button.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 18;

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: any;
  variant?: string;
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  tooltip?: string;
  menuItems?: ReactNode[];
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
      menuItems,
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
    } else if (variant === 'primary-ghost') {
      classNames.push(styles.primaryGhost);
    }

    if (className) {
      classNames.push(className);
    }

    const leftClassNames = [...classNames];
    const rightClassNames = [...classNames, styles.menuButton];

    if (menuItems) {
      leftClassNames.push(styles.leftWithMenu);
    }

    const b = (
      <>
        <button
          ref={ref}
          className={leftClassNames.join(' ')}
          type={htmlType}
          disabled={disabled}
          {...rest}
        >
          {icon && React.cloneElement(icon, { size: ICON_SIZE }, null)}
          {children && icon && <span style={{ width: 4 }} />}
          {children}
        </button>
        {menuItems && menuItems.length > 0 && (
          <Menu>
            <MenuButton
              disabled={disabled}
              className={rightClassNames.join(' ')}
            >
              <ChevronDownIcon size={14} style={{ marginTop: 2 }} />
            </MenuButton>
            <MenuList>{menuItems}</MenuList>
          </Menu>
        )}
      </>
    );

    // If the button is disabled the tooltip gets weird on hover
    if (!tooltip || disabled) {
      return b;
    }

    return <Tooltip label={tooltip}>{b}</Tooltip>;
  }
);

export default Button;
