import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'

const { Option } = Select

function ConnectionDropdown({ onChange, value }) {
  return (
    <Subscribe to={[ConnectionsContainer]}>
      {connectionsContainer => (
        <Select
          showSearch
          placeholder="Choose a connection"
          className="w-100"
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
