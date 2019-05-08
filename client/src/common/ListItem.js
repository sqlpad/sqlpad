import React from 'react';

const ListItem = ({ children, ...rest }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
        minHeight: 48,
        borderBottom: '1px solid rgb(232, 232, 232)'
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ListItem;
