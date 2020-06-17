import { MenuItem } from '@reach/menu-button';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import IconMenu from '../common/IconMenu';
import { api } from '../utilities/fetch-json.js';
import useAppContext from '../utilities/use-app-context';
import AboutModal from './AboutModal';

function AppMenu() {
  const { currentUser } = useAppContext();
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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
        <MenuItem onSelect={() => setShowAbout(true)}>About</MenuItem>
        <MenuItem
          onSelect={async () => {
            await api.get('/api/signout');
            setRedirectToSignIn(true);
          }}
          hidden={hideSignOut}
        >
          Sign out
        </MenuItem>
      </IconMenu>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default React.memo(AppMenu);
