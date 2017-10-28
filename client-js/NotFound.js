import React from 'react'
import App from './App.js'
import FullscreenMessage from './FullscreenMessage.js'

export default props => {
  document.title = 'SQLPad - Not Found'
  if (props.currentUser) {
    return (
      <App config={props.config} currentUser={props.currentUser}>
        <FullscreenMessage>Not Found</FullscreenMessage>
      </App>
    )
  }
  return <FullscreenMessage>Not Found</FullscreenMessage>
}
