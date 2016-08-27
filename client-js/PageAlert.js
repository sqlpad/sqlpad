var React = require('react');
var Alert = require('react-bootstrap/lib/Alert');
var Fade = require('react-bootstrap/lib/Fade');

var PageAlert = React.createClass({
    getInitialState: function () {
        return {
            showAlert: false
        }
    },
    alert: function (message, bsStyle) {
        this.setState({
            showAlert: true,
            message: message,
            bsStyle: bsStyle || "info"
        });
        setTimeout(() => {
            this.setState({
                showAlert: false,
                message: null,
                bsStyle: "info"
            });
        }, 1500);
    },
    render: function () {
        return (
            <Fade in={this.state.showAlert} transitionAppear={false} unmountOnExit={true}>
                <Alert bsStyle={this.state.bsStyle} className="PageAlert" >
                    {this.state.message}
                </Alert>
            </Fade>
        )
    }
});

module.exports = PageAlert;