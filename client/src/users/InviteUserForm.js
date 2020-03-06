import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain.js';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import Spacer from '../common/Spacer.js';
import fetchJson from '../utilities/fetch-json.js';

function InviteUserForm({ onInvited }) {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [isInviting, setIsInviting] = useState(null);

  const onInviteClick = async event => {
    event.preventDefault();
    event.stopPropagation();
    const user = {
      email,
      role
    };
    setIsInviting(true);
    const json = await fetchJson('POST', '/api/users', user);
    setIsInviting(false);
    if (json.error) {
      message.error('Add user failed: ' + json.error.toString());
      return false;
    }
    setEmail(null);
    setRole(null);
    onInvited();
  };

  return (
    <div>
      <p>
        Users may only sign up if they have first been added. Once added, invite
        them to continue the sign-up process on the{' '}
        <Link to={'/signup'}>signup page</Link>.
      </p>
      <form onSubmit={onInviteClick}>
        <label>
          Email
          <Input
            name="email"
            type="email"
            value={email || ''}
            error={!email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <Spacer size={2} />

        <label>
          role
          <Select
            name="role"
            value={role || ''}
            onChange={event => setRole(event.target.value)}
            error={!role}
          >
            <option value="" />
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </Select>
          <FormExplain>
            Admins can manage database connections and users
          </FormExplain>
        </label>

        <Spacer size={3} />
        <div>
          <Button
            htmlType="submit"
            className="w-100"
            variant="primary"
            onClick={onInviteClick}
            disabled={isInviting}
          >
            Add user
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InviteUserForm;
