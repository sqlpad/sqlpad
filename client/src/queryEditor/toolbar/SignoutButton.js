import Tooltip from 'antd/lib/tooltip';
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
    <Tooltip placement="bottom" title="Sign out">
      <Button
        onClick={async () => {
          await fetchJson('GET', '/api/signout');
          setRedirect(true);
        }}
      >
        Sign out
      </Button>
    </Tooltip>
  );
}

export default SignoutButton;
