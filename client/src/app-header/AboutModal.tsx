import React from 'react';
import Modal from '../common/Modal';
import useAppContext from '../utilities/use-app-context';
import AboutContent from './AboutContent';

function AboutModal({ visible, onClose }: any) {
  const { version } = useAppContext();
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

export default React.memo(AboutModal);
