import React from 'react'
import Icon from 'antd/lib/icon'

const CheckListItem = props => {
  if (!props.configKey || !props.configItems || !props.configItems.length) {
    return null
  }
  const configItem = props.configItems.find(item => {
    return item.key === props.configKey
  })
  if (!configItem) {
    return (
      <li style={{ listStyle: 'none' }}>
        <strong>{props.configKey} is not in configItems.</strong>
      </li>
    )
  }
  return (
    <li style={{ listStyle: 'none' }}>
      <Icon type={configItem.effectiveValue ? 'check' : 'close'} />{' '}
      {configItem.label || configItem.envVar}
    </li>
  )
}

export default CheckListItem
