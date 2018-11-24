import { Container } from 'unstated'
import fetchJson from '../utilities/fetch-json.js'

class AppContainer extends Container {
  state = {}

  refreshAppContext = async () => {
    const json = await fetchJson('GET', 'api/app')
    // Assign config.baseUrl to global
    // It doesn't change and is needed for fetch requests
    // This allows us to simplify the fetch() call
    if (!json.config) {
      return
    }
    window.BASE_URL = json.config.baseUrl
    return this.setState({
      config: json.config,
      smtpConfigured: json.smtpConfigured,
      googleAuthConfigured: json.googleAuthConfigured,
      currentUser: json.currentUser,
      passport: json.passport,
      adminRegistrationOpen: json.adminRegistrationOpen,
      version: json.version
    })
  }
}

export default AppContainer
