import Layout from 'antd/lib/layout';
import PropTypes from 'prop-types';
import React from 'react';

function Header({ children, title }) {
  return (
    <Layout.Header className="pr4 pl4">
      <div className="f3 fl white">{title}</div>
      <div className="fr">{children}</div>
    </Layout.Header>
  );
}

Header.propTypes = {
  title: PropTypes.string
};

Header.defaultProps = {
  title: ''
};

export default Header;
