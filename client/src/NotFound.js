import React from 'react'
import { Subscribe } from 'unstated'
import AppContainer from '../containers/AppContainer'
import AppNav from './AppNav.js'
import FullscreenMessage from './common/FullscreenMessage.js'

export default () => {
  return (
    <Subscribe to={[AppContainer]}>
      {appContainer => {
        document.title = 'SQLPad - Not Found'
        const { config, currentUser } = appContainer.state

        if (currentUser) {
          return (
            <AppNav config={config} currentUser={currentUser}>
              <FullscreenMessage>Not Found</FullscreenMessage>
            </AppNav>
          )
        }
        return <FullscreenMessage>Not Found</FullscreenMessage>
      }}
    </Subscribe>
  )
}
