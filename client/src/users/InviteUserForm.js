import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import React, { useState } from 'react';
import fetchJson from '../utilities/fetch-json.js';
import Button from '../common/Button';
import Select from '../common/Select';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;

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
        Users may only sign up if they have first been added. Once added, invite
        them to continue the sign-up process on the{' '}
        <Link to={'/signup'}>signup page</Link>.
      </p>
      <Form layout="vertical">
        <FormItem label="Email" validateStatus={email ? null : 'error'}>
          <Input
            name="email"
            type="email"
            value={email || ''}
            onChange={e => setEmail(e.target.value)}
          />
        </FormItem>
        <FormItem
          label="Role"
          extra="Admins can manage database connections and users"
          validateStatus={role ? null : 'error'}
        >
          <Select
            name="role"
            value={role || ''}
            onChange={event => setRole(event.target.value)}
          >
            <option value="" />
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </Select>
        </FormItem>
        <Button type="primary" onClick={onInviteClick} disabled={isInviting}>
          Add user
        </Button>
      </Form>
    </div>
  );
}

export default InviteUserForm;
