import React from 'react'

export default props => {
  const { className = '' } = props
  return (
    <td className={`pv3 pr3 bb b--black-20 ${className}`}>{props.children}</td>
  )
}
