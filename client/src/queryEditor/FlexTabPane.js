import React from 'react';
import PropTypes from 'prop-types';

function FlexTabPane({ activeTabKey, tabKey, children }) {
  const display = activeTabKey === tabKey ? 'flex' : 'none';
  return <div style={{ display, width: '100%' }}>{children}</div>;
}

FlexTabPane.propTypes = {
  activeTabKey: PropTypes.string,
  tabKey: PropTypes.string.isRequired
};

FlexTabPane.defaultProps = {
  activeTabKey: ''
};

export default FlexTabPane;
