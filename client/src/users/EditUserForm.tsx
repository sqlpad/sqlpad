import React, { ChangeEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import message from '../common/message';
import Select from '../common/Select';
import Spacer from '../common/Spacer';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

function EditUserForm({ userId }: any) {
  let { data: user } = api.useUser(userId);
  const { config } = useAppContext();

  const [role, setRole] = useState(user?.role);
  const [passwordResetId, setPasswordResetId] = useState(user?.passwordResetId);
  const [syncAuthRole, setSyncAuthRole] = useState<boolean | undefined | null>(
    user?.syncAuthRole
  );

  useEffect(() => {
    setRole(user?.role);
    setPasswordResetId(user?.passwordResetId);
    setSyncAuthRole(user?.syncAuthRole);
  }, [user]);

  // If still loading hide form
  if (!user) {
    return null;
  }

  const handleRoleChange = async (event: any) => {
    setRole(event.target.value);
    const json = await api.put(`/api/users/${user?.id}`, {
      role: event.target.value,
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error);
    }
    api.reloadUsers(user?.id);
  };

  const handleSyncAuthChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setSyncAuthRole(event.target.checked);
    const json = await api.put(`/api/users/${user?.id}`, {
      syncAuthRole: event.target.checked,
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error);
    }
    api.reloadUsers(user?.id);
  };

  const generatePasswordResetLink = async () => {
    const passwordResetId = uuidv4();
    const json = await api.put('/api/users/' + user?.id, {
      passwordResetId,
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error);
    }
    setPasswordResetId(passwordResetId);
    api.reloadUsers(user?.id);
  };

  const removePasswordResetLink = async () => {
    const json = await api.put(`/api/users/${user?.id}`, {
      passwordResetId: '',
    });
    if (json.error) {
      return message.error('Remove reset failed: ' + json.error);
    }
    setPasswordResetId(undefined);
  };

  const renderReset = () => {
    if (passwordResetId) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexBasis: '50%' }}>
            <Button className="w-100" onClick={removePasswordResetLink}>
              Remove reset link
            </Button>
          </div>
          <div style={{ flexBasis: '50%', textAlign: 'center' }}>
            <Link to={`/password-reset/${passwordResetId}`}>
              Password reset link
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div>
        <Button className="w-100" onClick={generatePasswordResetLink}>
          Generate password reset link
        </Button>
      </div>
    );
  };

  return (
    <div>
      <label>
        Role
        <Select name="role" value={role} onChange={handleRoleChange}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </label>
      <FormExplain>
        Admins can manage database connections and users
      </FormExplain>
      {config?.ldapConfigured && config?.ldapRolesConfigured && (
        <>
          <Spacer size={2} />
          <input
            type="checkbox"
            checked={Boolean(syncAuthRole)}
            id="syncAuthRole"
            name="syncAuthRole"
            onChange={handleSyncAuthChange}
          />
          <label htmlFor="syncAuthRole" style={{ marginLeft: 8 }}>
            Sync role with LDAP auth
          </label>
          <FormExplain>
            If LDAP Role filters are enabled, role assignment will be kept in
            sync as users log in if checked. Users created by LDAP auto-sign-up
            will have this turned on by default.
          </FormExplain>
        </>
      )}
      <Spacer size={3} />
      {renderReset()}
    </div>
  );
}

export default EditUserForm;
