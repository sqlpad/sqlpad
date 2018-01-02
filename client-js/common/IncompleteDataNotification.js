import React from 'react'
import ReactDOM from 'react-dom'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import Overlay from 'react-bootstrap/lib/Overlay'

export default class extends React.Component {
  state = { show: false }

  toggle = () => {
    this.setState({ show: !this.state.show })
  }

  render() {
    if (this.props.queryResult && this.props.queryResult.incomplete) {
      const sharedProps = {
        show: this.state.show,
        target: () => ReactDOM.findDOMNode(this.refs.incompleteDataTarget)
      }
      return (
        <span className="red pointer mr2" onClick={this.toggle}>
          <Glyphicon glyph="warning-sign" ref="incompleteDataTarget" />{' '}
          Incomplete
          <Overlay {...sharedProps} placement="bottom">
            <Popover id="incomplete-data-popover" title={'Incomplete Data'}>
              Return fewer rows or increase query result max rows in
              configuration.
            </Popover>
          </Overlay>
        </span>
      )
    }
    return null
  }
}
