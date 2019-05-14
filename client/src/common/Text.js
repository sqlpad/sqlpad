import React from 'react';

const Text = ({ children, type, style, ...rest }) => {
  const s = Object.assign({}, style);

  if (type === 'secondary') {
    s.color = 'rgba(0,0,0,0.45)';
  } else if (type === 'danger') {
    s.color = '#cf1322';
  }

  return (
    <span style={s} {...rest}>
      {children}
    </span>
  );
};

export default Text;
