import React from 'react';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Text from '../common/Text';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

function ConnectionList() {
  const { data: connectionsData, mutate } = api.useConnections();
  let connections = connectionsData || [];

  const deleteConnection = async (connectionId: string) => {
    const json = await api.deleteConnection(connectionId);
    mutate();
    if (json.error) {
      return message.error('Delete failed');
    }
  };

  const { currentUser } = useAppContext();

  const listItems = connections.map((item) => {
    // Only show the delete button if deletable is true.
    const actions = [];
    if (currentUser?.role === 'admin' && item.deletable) {
      actions.push(
        <DeleteConfirmButton
          key="delete"
          confirmMessage="Delete connection?"
          onConfirm={() => deleteConnection(item.id)}
          style={{ marginLeft: 8 }}
        >
          Delete
        </DeleteConfirmButton>
      );
    }

    return (
      <ListItem key={item.id}>
        <div style={{ flexGrow: 1, padding: 8 }}>
          <span style={{ width: 300, display: 'inline-block', marginRight: 8 }}>
            {item.name}
          </span>
          <Text type="secondary">{item.driver}</Text>
        </div>
        {actions}
      </ListItem>
    );
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1 }}>{listItems}</div>
    </div>
  );
}

export default ConnectionList;