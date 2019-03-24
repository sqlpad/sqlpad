import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Select from 'antd/lib/select';
import React, { useState } from 'react';
import fetchJson from '../utilities/fetch-json.js';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;
const { Option } = Select;

function InviteUserForm({ onInvited }) {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [isInviting, setIsInviting] = useState(null);

  const onInviteClick = async e => {
    const user = {
      email,
      role
    };
    setIsInviting(true);
    const json = await fetchJson('POST', '/api/users', user);
    setIsInviting(false);
    if (json.error) {
      return message.error('Whitelist failed: ' + json.error.toString());
    }
    setEmail(null);
    setRole(null);
    message.success('User Whitelisted');
    onInvited();
  };

  return (
    <div>
      <p>
        Users may only sign up if they have first been whitelisted. Once
        whitelisted, invite them to continue the sign-up process on the{' '}
        <Link to={'/signup'}>signup page</Link>.
      </p>
      <p>
        <strong>Admins</strong> can add and edit database connections, as well
        as whitelist/invite users to join.
      </p>
      <hr />
      <Form layout="vertical">
        <FormItem validateStatus={email ? null : 'error'}>
          <label className="near-black">Email</label>
          <Input
            name="email"
            type="email"
            value={email || ''}
            onChange={e => setEmail(e.target.value)}
          />
        </FormItem>
        <FormItem validateStatus={role ? null : 'error'}>
          <label className="near-black">Role</label>
          <Select
            name="role"
            value={role || ''}
            onChange={role => setRole(role)}
          >
            <Option value="editor">Editor</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </FormItem>
        <Button
          className="align-right"
          type="primary"
          onClick={onInviteClick}
          disabled={isInviting}
        >
          Whitelist User
        </Button>
      </Form>
    </div>
  );
}

export default InviteUserForm;
