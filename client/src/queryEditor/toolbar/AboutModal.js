import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import PropTypes from 'prop-types';
import React from 'react';
import AboutContent from './AboutContent';
import Modal from '../../common/Modal';

function mapStateToProps(state) {
  return {
    version: state.version || {}
  };
}

const ConnectedAboutModal = connect(
  mapStateToProps,
  actions
)(React.memo(AboutModal));

function AboutModal({ version, visible, onClose }) {
  return (
    <>
      <Modal
        width={650}
        title="About SQLPad"
        visible={visible}
        onClose={onClose}
      >
        <AboutContent version={version} />
      </Modal>
    </>
  );
}

AboutModal.propTypes = {
  version: PropTypes.object.isRequired
};

export default ConnectedAboutModal;
