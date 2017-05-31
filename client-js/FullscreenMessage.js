import React from 'react'

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  flexDirection: 'column',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  fontSize: 36
}

export default (props) => (
  <div style={style}>
    {props.children}
  </div>
)
