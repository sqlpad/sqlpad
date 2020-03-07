import { MenuItem } from '@reach/menu-button';
import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import IconMenu from '../common/IconMenu';
import { clearQueries } from '../stores/queries';
import fetchJson from '../utilities/fetch-json.js';
import AboutModal from './AboutModal';

const Connected = connect(null, store => ({
  clearQueries
}))(React.memo(AppMenu));

function AppMenu({ clearQueries }) {
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  if (redirectToSignIn) {
    return <Redirect push to="/signin" />;
  }

  return (
    <div>
      <IconMenu variant="ghost" icon={<DotsVerticalIcon aria-label="menu" />}>
        <MenuItem onSelect={() => setShowAbout(true)}>About</MenuItem>
        <MenuItem
          onSelect={async () => {
            await fetchJson('GET', '/api/signout');
            clearQueries();
            setRedirectToSignIn(true);
          }}
        >
          Sign out
        </MenuItem>
      </IconMenu>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default Connected;
