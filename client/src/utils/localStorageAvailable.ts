// ----------------------------------------------------------------------

export default function localStorageAvailable() {
  try {
    // Incognito mode might reject access to the localStorage for security reasons.
    // window isn't defined on Node.js
    // https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
    const key = "__some_random_key_you_are_not_going_to_use__"
    window.localStorage.setItem(key, key)

    window.localStorage.removeItem(key)

    return true
  } catch (err) {
    return false
  }
}
