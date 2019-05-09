import { Redirect } from 'react-router-dom';
import React, { useState } from 'react';
import fetchJson from '../../utilities/fetch-json.js';
import Button from '../../common/Button';

function SignoutButton() {
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return <Redirect push to="/signin" />;
  }

  return (
    <Button
      tooltip="Sign out"
      onClick={async () => {
        await fetchJson('GET', '/api/signout');
        setRedirect(true);
      }}
    >
      Sign out
    </Button>
  );
}

export default SignoutButton;
