import React from 'react';

const Divider = ({ style, ...rest }) => {
  const s = Object.assign(
    {
      height: 16
    },
    style
  );

  return (
    <div style={s}>
      <div style={{ height: 8, borderBottom: '1px solid #e8e8e8' }} />
    </div>
  );
};

export default Divider;
