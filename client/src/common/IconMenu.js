import React from 'react';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import Tooltip from './Tooltip';
import iconButtonStyles from './IconButton.module.css';

const ICON_SIZE = 18;

const IconMenu = ({ children, icon, tooltip, ...rest }) => {
  const menu = (
    <Menu>
      <MenuButton className={iconButtonStyles.btn} {...rest}>
        {icon &&
          React.cloneElement(
            icon,
            {
              size: ICON_SIZE
            },
            null
          )}
      </MenuButton>
      <MenuList>{children}</MenuList>
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
