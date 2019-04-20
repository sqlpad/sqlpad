import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import { Redirect } from 'react-router-dom';
import React, { useState } from 'react';
import fetchJson from '../../utilities/fetch-json.js';

function SignoutButton() {
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return <Redirect push to="/signin" />;
  }

  return (
    <Tooltip placement="bottom" title="Sign out">
      <Button
        type="ghost"
        onClick={async () => {
          await fetchJson('GET', '/api/signout');
          setRedirect(true);
        }}
        icon="logout"
      />
    </Tooltip>
  );
}

export default SignoutButton;
