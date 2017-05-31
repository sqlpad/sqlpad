import page from 'page'

/*
  navigateTo() returns a function used to navigate to a page via page.js
  General usage will be to assign to onClick handler for links.
  config.baseUrl does not need to be provided as page.js is aware of the base url.

  example: navigateTo('/somepage')
*/

export default function navigateToClickHandler (path) {
  return function (e) {
    e.preventDefault()
    e.stopPropagation()
    page(path)
  }
}
