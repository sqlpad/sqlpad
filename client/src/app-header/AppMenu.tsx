import { MenuItem } from '@reach/menu-button';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import IconMenu from '../common/IconMenu';
import { resetState } from '../stores/editor-actions';
import UserProfileModal from '../users/UserProfileModal';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';
import AboutModal from './AboutModal';

function AppMenu() {
  const { currentUser } = useAppContext();
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (redirectToSignIn) {
    return <Redirect push to="/signin" />;
  }

  let hideSignOut = false;
  if (!currentUser || currentUser.id === 'noauth') {
    hideSignOut = true;
  }

  return (
    <div>
      <IconMenu variant="ghost" icon={<DotsVerticalIcon aria-label="menu" />}>
        <MenuItem onSelect={() => setShowProfile(true)}>Profile</MenuItem>
        <MenuItem onSelect={() => setShowAbout(true)}>About</MenuItem>
        <MenuItem
          onSelect={async () => {
            await api.signout();
            resetState();
            setRedirectToSignIn(true);
          }}
          hidden={hideSignOut}
        >
          Sign out
        </MenuItem>
      </IconMenu>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
      <UserProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}

export default React.memo(AppMenu);
