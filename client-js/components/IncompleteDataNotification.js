var React = require('react')
var Glyphicon = require('react-bootstrap/lib/Glyphicon')
var Popover = require('react-bootstrap/lib/Popover')
var Overlay = require('react-bootstrap/lib/Overlay')
var ReactDOM = require('react-dom')

export default React.createClass({
  getInitialState () {
    return { show: false }
  },
  toggle () {
    this.setState({ show: !this.state.show })
  },
  render () {
    if (this.props.queryResult && this.props.queryResult.incomplete) {
      const sharedProps = {
        show: this.state.show,
        target: () => ReactDOM.findDOMNode(this.refs.incompleteDataTarget)
      }
      return (
        <span style={{color: 'red', cursor: 'pointer', marginRight: 10}} onClick={this.toggle}>
          <Glyphicon glyph='warning-sign' ref='incompleteDataTarget' style={{marginRight: 0}} /> Incomplete
          <Overlay {...sharedProps} placement='bottom'>
            <Popover id='incomplete-data-popover' title={'Incomplete Data'} >
              Return fewer rows or increase query result max rows in configuration.
            </Popover>
          </Overlay>
        </span>
      )
    }
    return null
  }
})
