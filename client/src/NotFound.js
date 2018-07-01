import React from 'react'
import AppNav from './AppNav.js'
import FullscreenMessage from './common/FullscreenMessage.js'

export default props => {
  document.title = 'SQLPad - Not Found'
  if (props.currentUser) {
    return (
      <AppNav config={props.config} currentUser={props.currentUser}>
        <FullscreenMessage>Not Found</FullscreenMessage>
      </AppNav>
    )
  }
  return <FullscreenMessage>Not Found</FullscreenMessage>
}
