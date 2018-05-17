import 'whatwg-fetch'
import message from 'antd/lib/message'

export default function fetchJson(method, url, body) {
  const BASE_URL = window.BASE_URL || ''
  const opts = {
    method: method.toUpperCase(),
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Expires: '-1',
      Pragma: 'no-cache'
    }
  }
  if (body) {
    opts.body = JSON.stringify(body)
  }

  let fetchUrl = BASE_URL + url
  if (BASE_URL && url.substring(0, 1) !== '/') {
    fetchUrl = BASE_URL + '/' + url
  }

  return fetch(fetchUrl, opts)
    .then(response => {
      // API server will send 200 even if error occurs
      // Eventually this should change to proper status code usage
      if (response.redirected) {
        return (window.location = response.url)
      } else if (response.status === 200) {
        return response.json()
      } else {
        console.error(response)
        throw new Error('Server responded not ok')
      }
    })
    .catch(error => {
      message.error(error.toString())
      return {
        error: 'Server responded not ok'
      }
    })
}
