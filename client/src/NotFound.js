import React from 'react'
import { Subscribe } from 'unstated'
import AppNav from './AppNav.js'
import FullscreenMessage from './common/FullscreenMessage.js'
import AppContainer from './containers/AppContainer'

export default () => {
  return (
    <Subscribe to={[AppContainer]}>
      {appContainer => {
        document.title = 'SQLPad - Not Found'
        const { currentUser } = appContainer.state

        if (currentUser) {
          return (
            <AppNav>
              <FullscreenMessage>Not Found</FullscreenMessage>
            </AppNav>
          )
        }
        return <FullscreenMessage>Not Found</FullscreenMessage>
      }}
    </Subscribe>
  )
}
