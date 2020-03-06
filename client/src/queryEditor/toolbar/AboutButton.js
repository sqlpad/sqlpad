import React, { useState } from 'react';
import AboutModal from './AboutModal';
import InfoIcon from 'mdi-react/InformationOutlineIcon';
import IconButton from '../../common/IconButton';

function AboutButton({ currentUser, clearQueries }) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div>
      <IconButton
        tooltip="About"
        variant="ghost"
        onClick={() => setShowAbout(true)}
      >
        <InfoIcon />
      </IconButton>
      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default AboutButton;
