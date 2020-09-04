import SuccessIcon from 'mdi-react/CheckboxMarkedCircleOutlineIcon';
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon';
import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import Button from '../common/Button';
import ErrorBlock from '../common/ErrorBlock';
import FormExplain from '../common/FormExplain';
import HorizontalFormItem from '../common/HorizontalFormItem';
import Input from '../common/Input';
import message from '../common/message';
import Select from '../common/Select';
import SpinKitCube from '../common/SpinKitCube';
import TextArea from '../common/TextArea';
import { api } from '../utilities/fetch-json';

const TEXT = 'TEXT';
const PASSWORD = 'PASSWORD';
const CHECKBOX = 'CHECKBOX';
const TEXTAREA = 'TEXTAREA';

function ConnectionForm({ connectionId, onConnectionSaved }: any) {
  const [connectionEdits, setConnectionEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [testError, setTestError] = useState(null);
  const [loading, setLoading] = useState(false);

  let { data: drivers } = useSWR('/api/drivers');
  drivers = drivers || [];

  async function getConnection(connectionId: any) {
    if (connectionId) {
      setLoading(true);
      const json = await api.get(`/api/connections/${connectionId}`);
      setLoading(false);
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

  const setConnectionValue = (key: any, value: any) => {
    setConnectionEdits((prev) => ({ ...prev, [key]: value }));
  };

  const setConnectionDataValue = (key: any, value: any) => {
    setConnectionEdits((prev) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
      const data = prev.data || {};
      return {
        ...prev,
        data: { ...data, [key]: value },
      };
    });
  };

  const testConnection = async () => {
    setTesting(true);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
    const data = connectionEdits.data || {};
    const json = await api.post('/api/test-connection', {
      ...connectionEdits,
      ...data,
    });
    setTesting(false);
    setTested(true);
    setTestError(json.error);
  };

  const saveConnection = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    setSaving(true);

    // connectionEdits.idleTimeoutMinutes needs to be converted to seconds
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'idleTimeoutMinutes' does not exist on ty... Remove this comment to see the full error message
    const idleTimeoutMinutes = parseInt(connectionEdits.idleTimeoutMinutes, 10);
    if (idleTimeoutMinutes) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'idleTimeoutSeconds' does not exist on ty... Remove this comment to see the full error message
      connectionEdits.idleTimeoutSeconds = idleTimeoutMinutes * 60;
    }

    let json;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{}'.
    if (connectionEdits.id) {
      json = await api.put(
        `/api/connections/${
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{}'.
          connectionEdits.id
        }`,
        connectionEdits
      );
    } else {
      json = await api.post('/api/connections', connectionEdits);
    }

    if (json.error) {
      setSaving(false);
      return message.error(json.error);
    }
    mutate('/api/connections');
    return onConnectionSaved(json.data);
  };

  const renderDriverFields = () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'driver' does not exist on type '{}'.
    if (connectionEdits.driver && drivers.length) {
      // NOTE connection.driver is driverId
      const driver = drivers.find(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'driver' does not exist on type '{}'.
        (driver: any) => driver.id === connectionEdits.driver
      );

      if (!driver) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'driver' does not exist on type '{}'.
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
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'multiStatementTransactionEnabled' does n... Remove this comment to see the full error message
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
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'idleTimeoutMinutes' does not exist on ty... Remove this comment to see the full error message
              value={connectionEdits.idleTimeoutMinutes || ''}
              onChange={(e: any) =>
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{}'.
      const connectionEditsData = connectionEdits.data || {};
      const driverInputs = fields.map((field: any) => {
        if (field.formType === TEXT) {
          const value = connectionEditsData[field.key] || '';
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <Input
                name={field.key}
                value={value}
                onChange={(e: any) =>
                  setConnectionDataValue(e.target.name, e.target.value)
                }
              />
              {field.description && (
                <FormExplain>
                  <div
                    dangerouslySetInnerHTML={{ __html: field.description }}
                  />
                </FormExplain>
              )}
            </HorizontalFormItem>
          );
        } else if (field.formType === PASSWORD) {
          const value = connectionEditsData[field.key] || '';
          // autoComplete='new-password' used to prevent browsers from autofilling username and password
          // Because we dont return a password, Chrome goes ahead and autofills
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <Input
                type="password"
                autoComplete="new-password"
                name={field.key}
                value={value}
                onChange={(e: any) =>
                  setConnectionDataValue(e.target.name, e.target.value)
                }
              />
              {field.description && (
                <FormExplain>
                  <div
                    dangerouslySetInnerHTML={{ __html: field.description }}
                  />
                </FormExplain>
              )}
            </HorizontalFormItem>
          );
        } else if (field.formType === CHECKBOX) {
          const checked = connectionEditsData[field.key] || false;
          return (
            <HorizontalFormItem key={field.key}>
              <input
                type="checkbox"
                checked={checked}
                id={field.key}
                name={field.key}
                onChange={(e) =>
                  setConnectionDataValue(e.target.name, e.target.checked)
                }
              />
              <label htmlFor={field.key} style={{ marginLeft: 8 }}>
                {field.label}
              </label>
              {field.description && (
                <FormExplain>
                  <div
                    dangerouslySetInnerHTML={{ __html: field.description }}
                  />
                </FormExplain>
              )}
            </HorizontalFormItem>
          );
        } else if (field.formType === TEXTAREA) {
          const value = connectionEditsData[field.key] || '';
          return (
            <HorizontalFormItem key={field.key} label={field.label}>
              <TextArea
                name={field.key}
                value={value}
                cols={45}
                placeholder={field.placeholder}
                onChange={(e: any) =>
                  setConnectionDataValue(e.target.name, e.target.value)
                }
              />
              {field.description && (
                <FormExplain>
                  <div
                    dangerouslySetInnerHTML={{ __html: field.description }}
                  />
                </FormExplain>
              )}
            </HorizontalFormItem>
          );
        }
        return null;
      });

      return fieldsJsx.concat(driverInputs);
    }
  };

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type '{}'.
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
      .sort((a: any, b: any) => a.name > b.name)
      .forEach((driver: any) =>
        driverSelectOptions.push(
          <option key={driver.id} value={driver.id}>
            {driver.name}
          </option>
        )
      );
  }

  if (loading) {
    return (
      <div className="h-100 w-100 flex-center">
        <SpinKitCube />
      </div>
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
            onChange={(e: any) =>
              setConnectionValue(e.target.name, e.target.value)
            }
          />
        </HorizontalFormItem>
        <HorizontalFormItem label="Driver">
          <Select
            name="driver"
            value={driver}
            error={!driver}
            onChange={(event: any) =>
              setConnectionValue('driver', event.target.value)
            }
          >
            {driverSelectOptions}
          </Select>
        </HorizontalFormItem>

        {renderDriverFields()}
      </div>
      {!testing && testError && (
        <div>
          <ErrorBlock>{testError}</ErrorBlock>
        </div>
      )}
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
          {!testing && tested && !testError && (
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
          {!testing && tested && testError && (
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
