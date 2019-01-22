import Select from 'antd/lib/select'
import React from 'react'
import { ConnectionsContext } from '../connections/ConnectionsStore'

const { Option } = Select

function ConnectionDropdown() {
  return (
    <ConnectionsContext.Consumer>
      {context => (
        <Select
          showSearch
          placeholder="Choose a connection"
          // TODO className is overridden by antdesign css?
          // className="w5"
          style={{ width: 260 }}
          optionFilterProp="children"
          value={context.selectedConnectionId}
          onChange={id => context.selectConnection(id)}
          filterOption={(input, option) =>
            option.props.value &&
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
              0
          }
        >
          <Option value="">Choose a connection...</Option>
          {context.connections.map(conn => {
            return (
              <Option key={conn._id} value={conn._id}>
                {conn.name}
              </Option>
            )
          })}
        </Select>
      )}
    </ConnectionsContext.Consumer>
  )
}

export default ConnectionDropdown
