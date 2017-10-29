import React from 'react'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import UserListRow from './UserListRow'

const styleUserList = {
  flexBasis: '50%',
  backgroundColor: '#FDFDFD',
  overflowY: 'auto',
  padding: 10
}

class UserList extends React.Component {
  render() {
    var listRows = this.props.users.map(user => {
      return (
        <UserListRow
          key={user._id}
          user={user}
          handleDelete={this.props.handleDelete}
          updateUserRole={this.props.updateUserRole}
          generatePasswordResetLink={this.props.generatePasswordResetLink}
          removePasswordResetLink={this.props.removePasswordResetLink}
          currentUser={this.props.currentUser}
        />
      )
    })
    return (
      <div style={styleUserList}>
        <ControlLabel>Users</ControlLabel>
        <ListGroup>{listRows}</ListGroup>
      </div>
    )
  }
}

export default UserList
