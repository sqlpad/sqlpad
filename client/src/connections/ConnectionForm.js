import SuccessIcon from 'mdi-react/CheckboxMarkedCircleOutlineIcon';
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import HorizontalFormItem from '../common/HorizontalFormItem.js';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import message from '../common/message';
import Select from '../common/Select';
import fetchJson from '../utilities/fetch-json.js';
import FormExplain from '../common/FormExplain';

const TEXT = 'TEXT';
const PASSWORD = 'PASSWORD';
const CHECKBOX = 'CHECKBOX';
const TEXTAREA = 'TEXTAREA';

function ConnectionForm({ connectionId, onConnectionSaved }) {
  const [connectionEdits, setConnectionEdits] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [testFailed, setTestFailed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  async function getDrivers() {
    const json = await fetchJson('GET', '/api/drivers');
    if (json.error) {
      message.error(json.error);
    } else {
      setDrivers(json.data);
    }
  }

  useEffect(() => {
    getDrivers();
  }, []);

  async function getConnection(connectionId) {
    if (connectionId) {
      const json = await fetchJson('GET', `/api/connections/${connectionId}`);
      if (json.error) {
        message.error(json.error);
      } else {
        // Convert seconds to minutes for a more user-friendly experience
        const idleTimeoutSeconds =
          json.data && parseInt(json.data.idleTimeoutSeconds, 10);
        if (idleTimeoutSeconds) {
          json.data.idleTimeoutMinutes = Math.round(idleTimeoutSeconds / 60);
        }
        setConnectionEdits(json.data);
      }
    }
  }

  useEffect(() => {
    getConnection(connectionId);
  }, [connectionId]);

  const setConnectionValue = (key, value) => {
    setConnectionEdits((prev) => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    setTesting(true);
    const json = await fetchJson(
      'POST',
      '/api/test-connection',
      connectionEdits
    );
    setTesting(false);
    setTestFailed(json.error ? true : false);
    setTestSuccess(json.error ? false : true);
  };

  const saveConnection = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    setSaving(true);

    // connectionEdits.idleTimeoutMinutes needs to be converted to seconds
    const idleTimeoutMinutes = parseInt(connectionEdits.idleTimeoutMinutes, 10);
    if (idleTimeoutMinutes) {
      connectionEdits.idleTimeoutSeconds = idleTimeoutMinutes * 60;
    }

    let json;
    if (connectionEdits.id) {
      json = await fetchJson(
        'PUT',
        '/api/connections/' + connectionEdits.id,
        connectionEdits
      );
    } else {
      json = await fetchJson('POST', '/api/connections', connectionEdits);
    }

    if (json.error) {
      setSaving(false);
      return message.error(json.error);
    }
    return onConnectionSaved(json.data);
  };

  const renderDriverFields = () => {
    if (connectionEdits.driver && drivers.length) {
      // NOTE connection.driver is driverId
      const driver = drivers.find(
        (driver) => driver.id === connectionEdits.driver
      );

      if (!driver) {
        console.error(`Driver ${connectionEdits.driver} not found`);
        return null;
      }

      const fieldsJsx = [];
      if (driver.supportsConnectionClient) {
        const mstKey = 'multiStatementTransactionEnabled';
        fieldsJsx.push(
          <HorizontalFormItem key={mstKey}>
            <input
              type="checkbox"
              checked={
                connectionEdits.multiStatementTransactionEnabled || false
              }
              id={mstKey}
              name={mstKey}
              onChange={(e) =>
                setConnectionValue(e.target.name, e.target.checked)
              }
            />
            <label htmlFor={mstKey} style={{ marginLeft: 8 }}>
              Enable multi-statement transaction support
            </label>
            <FormExplain>
              When enabled a persistent database connection will be opened and
              used for query executions, allowing things like opening
              transactions and creating temp tables across query executions.
            </FormExplain>
          </HorizontalFormItem>
        );

        fieldsJsx.push(
          <HorizontalFormItem
            key="idleTimeoutMinutes"
            label="Idle timeout (minutes)"
          >
            <Input
              name="idleTimeoutMinutes"
              type="number"
              value={connectionEdits.idleTimeoutMinutes || ''}
              onChange={(e) =>
                setConnectionValue(e.target.name, e.target.value)
              }
            />
            <FormExplain>
              Number of minutes to allow a connection to be idle before closing.
            </FormExplain>
          </HorizontalFormItem>
        );
      }

      const { fields } = driver;
      const driverInputs = fields.map((field) => {
        if (field.formType === TEXT) {
          const value = connectionEdits[field.key] || '';
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <Input
                name={field.key}
                value={value}
                onChange={(e) =>
                  setConnectionValue(e.target.name, e.target.value)
                }
              />
            </HorizontalFormItem>
          );
        } else if (field.formType === PASSWORD) {
          const value = connectionEdits[field.key] || '';
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <Input
                type="password"
                autoComplete="new-password"
                name={field.key}
                value={value}
                onChange={(e) =>
                  setConnectionValue(e.target.name, e.target.value)
                }
              />
            </HorizontalFormItem>
          );
        } else if (field.formType === CHECKBOX) {
          const checked = connectionEdits[field.key] || false;
          return (
            <HorizontalFormItem key={field.key}>
              <input
                type="checkbox"
                checked={checked}
                id={field.key}
                name={field.key}
                onChange={(e) =>
                  setConnectionValue(e.target.name, e.target.checked)
                }
              />
              <label htmlFor={field.key} style={{ marginLeft: 8 }}>
                {field.label}
              </label>
            </HorizontalFormItem>
          );
        } else if (field.formType === TEXTAREA) {
          const value = connectionEdits[field.key] || '';
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <TextArea
                name={field.key}
                value={value}
                cols={45}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setConnectionValue(e.target.name, e.target.value)
                }
              />
            </HorizontalFormItem>
          );
        }
        return null;
      });

      return fieldsJsx.concat(driverInputs);
    }
  };

  const { name = '', driver = '' } = connectionEdits;

  const driverSelectOptions = [<option key="none" value="" />];

  if (!drivers.length) {
    driverSelectOptions.push(
      <option key="loading" value="">
        Loading...
      </option>
    );
  } else {
    drivers
      .sort((a, b) => a.name > b.name)
      .forEach((driver) =>
        driverSelectOptions.push(
          <option key={driver.id} value={driver.id}>
            {driver.name}
          </option>
        )
      );
  }

  return (
    <form
      onSubmit={saveConnection}
      autoComplete="off"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        <HorizontalFormItem label="Connection name">
          <Input
            name="name"
            value={name}
            error={!name}
            onChange={(e) => setConnectionValue(e.target.name, e.target.value)}
          />
        </HorizontalFormItem>
        <HorizontalFormItem label="Driver">
          <Select
            name="driver"
            value={driver}
            error={!driver}
            onChange={(event) =>
              setConnectionValue('driver', event.target.value)
            }
          >
            {driverSelectOptions}
          </Select>
        </HorizontalFormItem>

        {renderDriverFields()}
      </div>
      <div
        style={{
          borderTop: '1px solid #e8e8e8',
          paddingTop: '22px',
          textAlign: 'right',
        }}
      >
        <Button
          htmlType="submit"
          style={{ width: 120 }}
          variant="primary"
          onClick={saveConnection}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>{' '}
        <Button
          style={{ width: 120 }}
          onClick={testConnection}
          disabled={testing}
        >
          {testing ? 'Testing...' : 'Test'}
          {!testing && testSuccess && (
            <SuccessIcon
              style={{
                marginLeft: 8,
                height: 18,
                width: 18,
                marginBottom: -4,
              }}
              color="#52c41a"
            />
          )}
          {!testing && testFailed && (
            <CloseCircleOutlineIcon
              style={{
                marginLeft: 8,
                height: 18,
                width: 18,
                marginBottom: -4,
              }}
              color="#eb2f96"
            />
          )}
        </Button>
      </div>
    </form>
  );
}

export default ConnectionForm;
