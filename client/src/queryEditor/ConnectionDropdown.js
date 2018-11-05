import Select from 'antd/lib/select'
import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/ConnectionsContainer'

const { Option } = Select

function ConnectionDropdown({ onChange, value }) {
  return (
    <Subscribe to={[ConnectionsContainer]}>
      {connectionsContainer => (
        <Select
          showSearch
          placeholder="Choose a connection"
          // TODO className is overridden by antdesign css?
          // className="w5"
          style={{ width: 260 }}
          optionFilterProp="children"
          value={value}
          onChange={onChange}
          filterOption={(input, option) =>
            option.props.value &&
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
              0
          }
        >
          <Option value="">Choose a connection...</Option>
          {connectionsContainer.state.connections.map(conn => {
            return (
              <Option key={conn._id} value={conn._id}>
                {conn.name}
              </Option>
            )
          })}
        </Select>
      )}
    </Subscribe>
  )
}

export default ConnectionDropdown
