import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Modal from '../../common/Modal';
import { actions } from '../../stores/unistoreStore';
import AboutContent from './AboutContent';

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
