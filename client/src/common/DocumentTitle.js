import React from 'react';
import PropTypes from 'prop-types';

class DocumentTitle extends React.Component {
  componentDidMount() {
    document.title = this.props.children;
  }

  render() {
    return null;
  }
}

DocumentTitle.propTypes = {
  children: PropTypes.string.isRequired
};

export default DocumentTitle;
