import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import Spacer from '../common/Spacer';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

interface Props {
  onInvited: () => void;
}

function InviteUserForm({ onInvited }: Props) {
  const { config } = useAppContext();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [syncAuthRole, setSyncAuthRole] = useState<boolean>(false);

  const onInviteClick = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const user = {
      email,
      role,
      syncAuthRole,
    };
    setIsInviting(true);
    const json = await api.post('/api/users', user);
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
      {config?.localAuthConfigured && (
        <p>
          Once added, invite users to continue the sign-up process on the{' '}
          <Link to={'/signup'}>signup page</Link>.
        </p>
      )}
      <form onSubmit={onInviteClick}>
        <label>
          Email
          <Input
            name="email"
            type="email"
            value={email || ''}
            error={!email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </label>
        <Spacer size={2} />

        <label>
          Role
          <Select
            name="role"
            value={role || ''}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setRole(event.target.value)
            }
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

        {config?.ldapConfigured && config?.ldapRolesConfigured && (
          <>
            <Spacer size={2} />
            <input
              type="checkbox"
              checked={syncAuthRole}
              id="syncAuthRole"
              name="syncAuthRole"
              onChange={(e) => setSyncAuthRole(e.target.checked)}
            />
            <label htmlFor="syncAuthRole" style={{ marginLeft: 8 }}>
              Sync role with LDAP auth
            </label>
            <FormExplain>
              If LDAP Role filters are enabled, role assignment will be kept in
              sync as users log in if checked. Users created by LDAP
              auto-sign-up will have this turned on by default.
            </FormExplain>
          </>
        )}

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
