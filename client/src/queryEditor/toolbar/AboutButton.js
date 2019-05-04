import Tooltip from 'antd/lib/tooltip';
import Modal from 'antd/lib/modal';
import HelpIcon from 'mdi-react/HelpCircleOutlineIcon';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import PropTypes from 'prop-types';
import React from 'react';
import AboutContent from './AboutContent';
import Button from '../../common/Button';

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
        onClick={() => {
          Modal.info({
            width: 650,
            title: 'About SQLPad',
            maskClosable: true,
            content: <AboutContent version={version} />,
            onOk() {}
          });
        }}
      >
        <HelpIcon size={18} style={{ marginTop: 5 }} />
      </Button>
    </Tooltip>
  );
}

AboutButton.propTypes = {
  version: PropTypes.object.isRequired
};

export default ConnectedEditorNavBar;
