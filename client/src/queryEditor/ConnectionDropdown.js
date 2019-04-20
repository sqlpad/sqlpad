import Select from 'antd/lib/select';
import Icon from 'antd/lib/icon';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';
import ConnectionListDrawer from '../connections/ConnectionListDrawer';

const { Option } = Select;

function ConnectionDropdown({
  addUpdateConnection,
  connections,
  currentUser,
  selectConnectionId,
  selectedConnectionId
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const handleChange = id => {
    if (id === 'new') {
      return setShowEdit(true);
    }
    if (id === 'manage') {
      return setShowConnections(true);
    }
    selectConnectionId(id);
  };

  const handleConnectionSaved = connection => {
    addUpdateConnection(connection);
    selectConnectionId(connection._id);
    setShowEdit(false);
  };

  // NOTE in order by placeholder to appear value must be set to undefined
  return (
    <>
      <Select
        showSearch
        placeholder="Choose a connection"
        style={{ width: 260 }}
        optionFilterProp="children"
        value={selectedConnectionId || undefined}
        onChange={handleChange}
        filterOption={(input, option) =>
          option.props.value &&
          option.props.name &&
          option.props.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {connections.map(conn => {
          return (
            <Option key={conn._id} value={conn._id} name={conn.name}>
              {conn.name}
            </Option>
          );
        })}

        <Option
          style={{ borderTop: '1px solid #ccc' }}
          value="new"
          name="New connection"
        >
          <Icon type="plus-circle" /> <em>New connection</em>
        </Option>
        {currentUser.role === 'admin' && (
          <Option value="manage" name="Manage connections">
            <Icon type="api" /> <em>Manage connections</em>
          </Option>
        )}
      </Select>
      <ConnectionEditDrawer
        visible={showEdit}
        placement="right"
        onClose={() => setShowEdit(false)}
        onConnectionSaved={handleConnectionSaved}
      />
      <ConnectionListDrawer
        visible={showConnections}
        onClose={() => setShowConnections(false)}
      />
    </>
  );
}

export default connect(
  ['connections', 'currentUser', 'selectedConnectionId'],
  actions
)(ConnectionDropdown);
