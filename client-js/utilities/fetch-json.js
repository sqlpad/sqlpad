import 'whatwg-fetch'

export default function fetchJson (verb, url, body) {
  var opts = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  if (!verb) throw new Error('You must supply a verb to the fetch wrapper')
  opts.method = verb.toUpperCase()
  if (body) opts.body = JSON.stringify(body)
  return fetch(url, opts).then((response) => {
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
