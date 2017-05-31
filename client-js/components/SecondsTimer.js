import React from 'react'

var SecondsTimer = React.createClass({
  _mounted: false,
  getInitialState: function () {
    return {
      runSeconds: 0
    }
  },
  timer: function () {
    if (this._mounted) {
      var now = new Date()
      this.setState({
        runSeconds: ((now - this.props.startTime) / 1000).toFixed(0)
      })
      setTimeout(this.timer, 33)
    }
  },
  componentDidMount: function () {
    this._mounted = true
    this.timer()
  },
  componentWillUnmount: function () {
    this._mounted = false
  },
  render: function () {
    return (
      <span>{this.state.runSeconds}</span>
    )
  }
})

export default SecondsTimer
