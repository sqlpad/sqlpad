import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import Spacer from '../common/Spacer';
import { api } from '../utilities/fetch-json';

function InviteUserForm({ onInvited }: any) {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [isInviting, setIsInviting] = useState(null);

  const onInviteClick = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const user = {
      email,
      role,
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
    setIsInviting(true);
    const json = await api.post('/api/users', user);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'false' is not assignable to para... Remove this comment to see the full error message
    setIsInviting(false);
    if (json.error) {
      message.error('Add user failed: ' + json.error);
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
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </label>
        <Spacer size={2} />

        <label>
          role
          <Select
            name="role"
            value={role || ''}
            onChange={(event: any) => setRole(event.target.value)}
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
            // @ts-expect-error
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
