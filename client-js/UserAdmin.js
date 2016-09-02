var React = require('react');
var fetchJson = require('./fetch-json.js');
var deepEqual = require('deep-equal');
var moment = require('moment');
var Alert = require('react-s-alert').default;

var Panel = require('react-bootstrap/lib/Panel');
var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var Checkbox = require('react-bootstrap/lib/Checkbox');
var Button = require('react-bootstrap/lib/Button');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');


var UserAdmin = React.createClass({
    getInitialState: function () {
        return {
            users: [],
            isSaving: false
        }
    },
    componentDidMount: function () {
        this.loadUsersFromServer();
    },
    handleDelete: function (user) {
        fetchJson('DELETE', this.props.config.baseUrl + '/api/users/' + user._id)
            .then((json) => {
                if (json.error) return Alert.error('Delete Failed: ' + json.error.toString());
                Alert.success('User Deleted');
                this.loadUsersFromServer();
            })
            .catch((ex) => {
                return Alert.error('Delete Failed');
            })
    },
    loadUsersFromServer: function () {
        fetchJson('get', baseUrl + "/api/users")
            .then((json) => {
                this.setState({users: json.users});
            }).catch(function(ex) {
                return Alert.error(ex.toString());
            });
    },
    updateUserRole: function (user) {
        this.setState({isSaving: true});
        fetchJson('PUT', this.props.config.baseUrl + '/api/users/' + user._id, {admin: user.admin})
            .then((json) => {
                this.loadUsersFromServer();
                this.setState({isSaving: false});
                if (json.error) return Alert.error('Update failed: ' + json.error.toString());
                Alert.success('User Updated');
            })
    },
    render: function () {
        return (
            <div>
                <UserList 
                    users={this.state.users}
                    handleDelete={this.handleDelete}
                    updateUserRole={this.updateUserRole}
                    currentUser={this.props.currentUser}
                    />
                <InviteUserForm 
                    loadUsersFromServer={this.loadUsersFromServer}
                    config={this.props.config}
                    />
                <Alert stack={{limit: 3}} position='bottom-right' />
            </div>
        )
    }
});

module.exports = UserAdmin;





var UserList = React.createClass({
    style: {
        position: 'absolute',
        left: 0,
        width: '60%',
        top: 50,
        bottom: 0,
        backgroundColor: '#FDFDFD',
        overflowY: 'auto',
        padding: 10
    },
    render: function () {
        var listRows = this.props.users.map((user) => {
            return (
                <UserListRow 
                    key={user._id}
                    user={user}
                    handleDelete={this.props.handleDelete}
                    updateUserRole={this.props.updateUserRole}
                    currentUser={this.props.currentUser}
                    />
            )
        });
        return (
            <div style={this.style}>
                <ControlLabel>Users</ControlLabel>
                <ListGroup>
                    {listRows}
                </ListGroup>
            </div>
        )
    }
});




var UserListRow = React.createClass({
    onDelete: function (e) {
        this.props.handleDelete(this.props.user);
    },
    onRoleChange: function (e) {
        var user = this.props.user;
        user.role = e.target.value;
        user.admin = (user.role == 'admin');
        this.props.updateUserRole(user);
    },
    formControlStyle: {
        minWidth: 200,
        marginLeft: 20
    },
    render: function () {
        var getClassNames = () => {
            return "list-group-item ListRow"
        }
        const popoverClick = (
            <Popover id="popover-trigger-click"  title="Are you sure?">
                <Button bsStyle="danger" onClick={this.onDelete} style={{width: '100%'}}>delete</Button>
            </Popover>
        );
        var signupDate = () => {
            if (!this.props.user.signupDate) return (<h5>Signup Date: <em>not signed up yet</em></h5>);
            return (<h5>Signup Date: {moment(this.props.user.signupDate).calendar()}</h5>);
        }
        return (
            <li className={getClassNames()}>
                <h4>{this.props.user.email}</h4>
                {signupDate()}
                <Form inline>
                    <FormGroup controlId="role">
                        <ControlLabel>Role</ControlLabel>{" "}
                        <FormControl style={this.formControlStyle} componentClass="select" value={this.props.user.admin ? 'admin' : 'editor'} disabled={this.props.currentUser._id == this.props.user._id} onChange={this.onRoleChange}>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </FormControl>
                    </FormGroup>
                </Form>
                
                <OverlayTrigger trigger="click" placement="left" container={this} rootClose overlay={popoverClick}>
                    <a className="ListRowDeleteButton" href="#"><Glyphicon glyph="trash" /></a>
                </OverlayTrigger>
            </li>
        )
    }
})




var InviteUserForm = React.createClass({
    style: {
        position: 'absolute',
        right: 0,
        width: '40%',
        top: 50,
        bottom: 0,
        backgroundColor: '#FDFDFD',
        overflowY: 'auto',
        padding: 10
    },
    getInitialState: function () {
        return {
            email: null,
            role: null,
            admin: false,
            isInviting: false
        }
    },
    onEmailChange: function (e) {
        this.setState({email: e.target.value});
    },
    onRoleChange: function (e) {
        this.setState({
            role: e.target.value,
            admin: (e.target.value && e.target.value.toLowerCase() == 'admin')  
        });
    },
    onInviteClick: function (e) {
        var user = {
            email: this.state.email,
            admin: this.state.admin
        }
        this.setState({
            isInviting: true
        });
        fetchJson('POST', this.props.config.baseUrl + '/api/users', user)
            .then((json) => {
                this.setState({
                    isInviting: false
                });
                if (json.error) return Alert.error('Whitelist failed: ' + json.error.toString());
                Alert.success('User Whitelisted');
                this.props.loadUsersFromServer();
            })
    },
    render: function () {
        return (
            <div style={this.style}>
                <ControlLabel>Invite User</ControlLabel>
                <Panel>
                    <Form>
                        <p>
                            Users may only sign up if they have first been whitelisted. 
                            Once whitelisted, invite them to 
                            continue the sign-up process on the <a href="<%= baseUrl %>/signup">signup page</a>.
                        </p>
                        <p>
                            <strong>Admins</strong> can add and edit database connections,
                            as well as whitelist/invite users to join.
                        </p>
                        <hr/>
                        <FormGroup controlId="email" validationState={(this.state.email ? null : 'warning')}>
                            <ControlLabel>Email</ControlLabel>
                            <FormControl type="text" value={this.state.email || ''} onChange={this.onEmailChange} />
                        </FormGroup>
                        <FormGroup controlId="role" validationState={(this.state.role ? null : 'warning')}>
                            <ControlLabel>Role</ControlLabel>
                            <FormControl componentClass="select" value={this.state.role || ''} onChange={this.onRoleChange}>
                                <option value=""></option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </FormControl>
                        </FormGroup>
                        <Button onClick={this.onInviteClick} disabled={this.state.isInviting}>
                            Whitelist User
                        </Button>
                    </Form>
                </Panel>
            </div>   
        );
    }
})