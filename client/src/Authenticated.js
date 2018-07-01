import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import AppNav from './AppNav.js'

class Authenticated extends React.Component {
  state = {
    loading: true
  }

  componentDidMount() {
    return fetchJson('GET', 'api/app').then(json => {
      this.setState({
        loading: false,
        config: json.config,
        smtpConfigured: json.smtpConfigured,
        googleAuthConfigured: json.googleAuthConfigured,
        currentUser: json.currentUser,
        passport: json.passport,
        adminRegistrationOpen: json.adminRegistrationOpen,
        version: json.version
      })
    })
  }

  render() {
    const { admin, component, ...rest } = this.props
    const { config, currentUser, loading } = this.state

    if (loading) {
      return null
    }

    if (!currentUser) {
      return <Redirect to={{ pathname: '/signin' }} />
    }

    if (admin && currentUser.role !== 'admin') {
      return <Redirect to={{ pathname: '/queries' }} />
    }

    const Component = component

    return (
      <AppNav config={config} currentUser={currentUser}>
        <Component config={config} currentUser={currentUser} {...rest} />
      </AppNav>
    )
  }
}

Authenticated.propTypes = {
  admin: PropTypes.bool,
  component: PropTypes.func.isRequired
}

export default Authenticated
