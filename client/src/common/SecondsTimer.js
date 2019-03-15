import React from 'react';

class SecondsTimer extends React.Component {
  state = {
    runSeconds: 0
  };

  _mounted = false;

  timer = () => {
    if (this._mounted) {
      var now = new Date();
      this.setState({
        runSeconds: ((now - this.props.startTime) / 1000).toFixed(0)
      });
      setTimeout(this.timer, 33);
    }
  };

  componentDidMount() {
    this._mounted = true;
    this.timer();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    return <span>{this.state.runSeconds}</span>;
  }
}

export default SecondsTimer;
