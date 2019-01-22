import React from 'react'
import AppContext from './AppContext'

export function withAppContext(Component) {
  return function ConnectedComponent(props) {
    return (
      <AppContext.Consumer>
        {appContext => <Component {...props} appContext={appContext} />}
      </AppContext.Consumer>
    )
  }
}

export default withAppContext
