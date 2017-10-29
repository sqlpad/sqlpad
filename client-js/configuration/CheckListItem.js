import React from 'react'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'

const CheckListItem = props => {
  if (!props.configKey || !props.configItems || !props.configItems.length) {
    return null
  }
  var configItem = props.configItems.find(item => {
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
      <Glyphicon glyph={configItem.effectiveValue ? 'ok' : 'remove'} />{' '}
      {configItem.label || configItem.envVar}
    </li>
  )
}

export default CheckListItem
