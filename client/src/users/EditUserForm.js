import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import React, { useState } from 'react';
import fetchJson from '../utilities/fetch-json.js';
import { Link } from 'react-router-dom';
import uuid from 'uuid';

const FormItem = Form.Item;
const { Option } = Select;

function EditUserForm({ user }) {
  const [role, setRole] = useState(user.role);
  const [passwordResetId, setPasswordResetId] = useState(user.passwordResetId);

  const handleRoleChange = async role => {
    setRole(role);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      role
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
  };

  const generatePasswordResetLink = async () => {
    const passwordResetId = uuid.v4();
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    setPasswordResetId(passwordResetId);
  };

  const removePasswordResetLink = async () => {
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    });
    if (json.error) {
      return message.error('Remove reset failed: ' + json.error.toString());
    }
    setPasswordResetId(null);
  };

  const renderReset = () => {
    if (passwordResetId) {
      return (
        <Row type="flex" gutter={24} align="middle">
          <Col span={12}>
            <Button className="w-100" onClick={removePasswordResetLink}>
              Remove
            </Button>
          </Col>
          <Col className="tc" span={12}>
            <Link to={`/password-reset/${passwordResetId}`}>
              Password reset link
            </Link>
          </Col>
        </Row>
      );
    }
    return (
      <Row gutter={24}>
        <Col span={12}>
          <Button className="w-100" onClick={generatePasswordResetLink}>
            Generate password reset link
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <Form layout="vertical">
      <FormItem
        label="Role"
        extra="Admins can manage database connections and users"
      >
        <Select name="role" value={role} onChange={handleRoleChange}>
          <Option value="editor">Editor</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </FormItem>
      {renderReset()}
    </Form>
  );
}

export default EditUserForm;
