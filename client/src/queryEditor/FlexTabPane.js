import React from 'react';
import PropTypes from 'prop-types';

class FlexTabPane extends React.Component {
  render() {
    const { activeTabKey, tabKey } = this.props;
    const display = activeTabKey === tabKey ? 'flex' : 'none';
    return <div style={{ display, width: '100%' }}>{this.props.children}</div>;
  }
}

FlexTabPane.propTypes = {
  activeTabKey: PropTypes.string,
  tabKey: PropTypes.string.isRequired
};

FlexTabPane.defaultProps = {
  activeTabKey: ''
};

export default FlexTabPane;
