import Select from 'antd/lib/select';
import Icon from 'antd/lib/icon';
import React, { useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import ConnectionEditDrawer from '../connections/ConnectionEditDrawer';

const { Option } = Select;

function ConnectionDropdown({
  connections,
  selectConnectionId,
  selectedConnectionId,
  addUpdateConnection
}) {
  const [showEdit, setShowEdit] = useState(false);

  const handleChange = id => {
    if (id === 'new') {
      return setShowEdit(true);
    }
    selectConnectionId(id);
  };

  const handleConnectionSaved = connection => {
    addUpdateConnection(connection);
    selectConnectionId(connection._id);
    setShowEdit(false);
  };

  return (
    <>
      <Select
        showSearch
        placeholder="Choose a connection"
        // TODO className is overridden by antdesign css?
        // className="w5"
        style={{ width: 260 }}
        optionFilterProp="children"
        value={selectedConnectionId}
        onChange={handleChange}
        filterOption={(input, option) =>
          option.props.value &&
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value="">
          <em>Choose a connection...</em>
        </Option>
        {connections.map(conn => {
          return (
            <Option key={conn._id} value={conn._id}>
              {conn.name}
            </Option>
          );
        })}
        <Option value="new">
          <Icon type="plus-circle" /> <em>New connection</em>
        </Option>
      </Select>
      <ConnectionEditDrawer
        visible={showEdit}
        placement="left"
        onClose={() => setShowEdit(false)}
        onConnectionSaved={handleConnectionSaved}
      />
    </>
  );
}

export default connect(
  ['connections', 'selectedConnectionId'],
  actions
)(ConnectionDropdown);
