import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'unistore/react';
import styles from '../../common/Button.module.css';
import { clearQueries } from '../../stores/queries';
import fetchJson from '../../utilities/fetch-json.js';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps, store => ({
  clearQueries
}))(React.memo(UserButton));

function UserButton({ currentUser, clearQueries }) {
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);

  if (redirectToSignIn) {
    return <Redirect push to="/signin" />;
  }

  return (
    <div>
      <Menu>
        <MenuButton className={`${styles.btn} ${styles.ghost}`}>
          {currentUser.name || currentUser.email}
        </MenuButton>
        <MenuList style={{ padding: 8 }} className="slide-down">
          <MenuItem
            onSelect={async () => {
              await fetchJson('GET', '/api/signout');
              clearQueries();
              setRedirectToSignIn(true);
            }}
          >
            Sign out
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}

export default Connected;
