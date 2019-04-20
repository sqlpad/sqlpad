import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import PropTypes from 'prop-types';
import React from 'react';
import AboutContent from './AboutContent';

function mapStateToProps(state) {
  return {
    version: state.version || {}
  };
}

const ConnectedEditorNavBar = connect(
  mapStateToProps,
  actions
)(React.memo(AboutButton));

function AboutButton({ version }) {
  return (
    <Tooltip placement="bottom" title="About">
      <Button
        type="ghost"
        onClick={() => {
          Modal.info({
            width: 650,
            title: 'About SQLPad',
            maskClosable: true,
            content: <AboutContent version={version} />,
            onOk() {}
          });
        }}
        icon="question-circle-o"
      />
    </Tooltip>
  );
}

AboutButton.propTypes = {
  version: PropTypes.object.isRequired
};

export default ConnectedEditorNavBar;
