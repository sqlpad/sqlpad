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
          Add user
        </Button>
      </Form>
    </div>
  );
}

export default InviteUserForm;
