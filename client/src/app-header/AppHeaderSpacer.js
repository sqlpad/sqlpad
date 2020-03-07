import PropTypes from 'prop-types';
import React from 'react';

const growSpacerStyle = { flexShrink: 0, flexGrow: 1, width: 8 };
const spacerStyle = { flexShrink: 0, width: 8 };

function AppHeaderSpacer({ grow }) {
  if (grow) {
    return <div style={growSpacerStyle} />;
  }
  return <div style={spacerStyle} />;
}

AppHeaderSpacer.propTypes = {
  grow: PropTypes.bool
};

export default AppHeaderSpacer;
