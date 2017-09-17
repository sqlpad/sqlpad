import 'whatwg-fetch'

export default function fetchJson (method, url, body) {
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
  return fetch(url, opts).then(response => {
    if (response.status === 200) {
      return response.json()
    } else {
      console.error(response)
      return {
        error: 'Server responded not ok'
      }
    }
  })
}
