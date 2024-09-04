import React from 'react';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import Tooltip from './Tooltip';
import iconButtonStyles from './IconButton.module.css';

const ICON_SIZE = 18;

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: any;
  variant?: string;
  tooltip?: string;
}

const IconMenu = ({ children, icon, tooltip, variant, ...rest }: Props) => {
  const className =
    variant === 'ghost'
      ? `${iconButtonStyles.btn} ${iconButtonStyles.ghost}`
      : iconButtonStyles.btn;

  const menu = (
    <Menu>
      <MenuButton className={className} {...rest}>
        {icon &&
          React.cloneElement(
            icon,
            {
              size: ICON_SIZE,
            },
            null
          )}
      </MenuButton>
      <MenuList className="slide-down">{children}</MenuList>
    </Menu>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        <span>{menu}</span>
      </Tooltip>
    );
  }

  return menu;
};

export default IconMenu;
