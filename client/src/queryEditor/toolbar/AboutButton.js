import HelpIcon from 'mdi-react/HelpCircleOutlineIcon';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import AboutContent from './AboutContent';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

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
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        tooltip="About"
        icon={<HelpIcon />}
        onClick={() => setVisible(true)}
      />
      <Modal
        width={650}
        title="About SQLPad"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <AboutContent version={version} />
      </Modal>
    </>
  );
}

AboutButton.propTypes = {
  version: PropTypes.object.isRequired
};

export default ConnectedEditorNavBar;
