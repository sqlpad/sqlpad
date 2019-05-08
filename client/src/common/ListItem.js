import React from 'react';

const ListItem = ({ children, style, ...rest }) => {
  const s = Object.assign(
    {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginTop: 8,
      marginBottom: 8,
      minHeight: 48,
      borderBottom: '1px solid rgb(232, 232, 232)'
    },
    style
  );
  return (
    <div style={s} {...rest}>
      {children}
    </div>
  );
};

export default ListItem;
