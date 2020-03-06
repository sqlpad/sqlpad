import React, { useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../../common/Button';
import Drawer from '../../common/Drawer';
import { clearQueries } from '../../stores/queries';
import UserList from '../../users/UserList';

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

const Connected = connect(mapStateToProps, store => ({
  clearQueries
}))(React.memo(UsersButton));

function UsersButton({ currentUser, clearQueries }) {
  const [showUsers, setShowUsers] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => setShowUsers(true)}>
        Users
      </Button>

      <Drawer
        title={'Users'}
        visible={showUsers}
        width={600}
        onClose={() => setShowUsers(false)}
        placement={'left'}
      >
        <UserList />
      </Drawer>
    </div>
  );
}

export default Connected;
