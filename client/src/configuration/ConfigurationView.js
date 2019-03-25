import Col from 'antd/lib/col';
import Layout from 'antd/lib/layout';
import message from 'antd/lib/message';
import Row from 'antd/lib/row';
import debounce from 'lodash.debounce';
import React, { useState, useEffect } from 'react';
import AppNav from '../AppNav';
import Header from '../common/Header';
import fetchJson from '../utilities/fetch-json.js';
import CheckListItem from './CheckListItem';
import ConfigEnvDocumentation from './ConfigEnvDocumentation';
import ConfigItemInput from './ConfigItemInput';

const { Content } = Layout;

function ConfigurationView() {
  const [configItems, setConfigItems] = useState([]);

  const loadConfigValuesFromServer = async () => {
    const json = await fetchJson('GET', '/api/config-items');
    if (json.error) {
      message.error(json.error);
    }
    setConfigItems(json.configItems);
  };

  const saveConfigValue = debounce(async (key, value) => {
    const json = await fetchJson('POST', '/api/config-values/' + key, {
      value: value
    });
    if (json.error) {
      message.error('Save failed');
    } else {
      message.success('Value saved');
      loadConfigValuesFromServer();
    }
  }, 500);

  useEffect(() => {
    document.title = 'SQLPad - Configuration';
    loadConfigValuesFromServer();
  }, []);

  const renderInfo = config => {
    const disabled =
      config.effectiveValueSource === 'cli' ||
      config.effectiveValueSource === 'saved cli' ||
      config.effectiveValueSource === 'env';

    const effectiveValueSourceLabels = {
      cli: 'Command Line',
      'saved cli': 'Saved Command Line',
      env: 'Environment Varialbe'
    };
    const overriddenBy =
      effectiveValueSourceLabels[config.effectiveValueSource];

    const defaultValue =
      config.default === '' ? (
        <em>empty</em>
      ) : (
        <span>{config.default.toString()}</span>
      );

    const cliFlag =
      config.cliFlag && config.cliFlag.pop
        ? config.cliFlag.pop()
        : config.cliFlag;

    return (
      <div className="mt4">
        <p>{config.description}</p>
        <p>
          <span>Default:</span> {defaultValue}
        </p>
        {cliFlag && (
          <p>
            <span>CLI Flag:</span> --{cliFlag}
          </p>
        )}
        {config.envVar && (
          <p>
            <span>Environment Variable:</span> {config.envVar}
          </p>
        )}
        {disabled && (
          <div>
            <p>
              <span>Set By:</span> {overriddenBy}
            </p>
            <p>
              When set by command line or environment, item is not configurable
              via UI.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConfigInputs = () => {
    const uiConfigItems = configItems.filter(
      config => config.interface === 'ui'
    );
    return (
      <div className="bg-white w-100 pa4">
        {uiConfigItems.map(config => {
          return (
            <Row key={config.key} className="mt5 bb b--near-white" gutter={16}>
              <Col span={10}>
                <div>
                  <label>{config.label}</label>
                  <ConfigItemInput
                    config={config}
                    saveConfigValue={saveConfigValue}
                  />
                </div>
              </Col>
              <Col span={14}>
                <div>{renderInfo(config)}</div>
              </Col>
            </Row>
          );
        })}
      </div>
    );
  };

  return (
    <AppNav>
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Header title="Configuration" />
        <Content className="ma4">
          <Row gutter={16}>
            <Col span={16}>{renderConfigInputs()}</Col>
            <Col span={8}>
              <div className="bg-white ba br2 b--light-gray pa4">
                <p>
                  <strong>Feature Checklist</strong>
                </p>
                <p>Unlock features by providing the required configuration.</p>
                <hr />
                <strong>Email</strong>
                <ul style={{ paddingLeft: 20 }}>
                  <CheckListItem
                    configKey={'smtpUser'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'smtpHost'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'smtpPort'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'smtpFrom'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'publicUrl'}
                    configItems={configItems}
                  />
                </ul>
                <strong>Google OAuth</strong>
                <ul style={{ paddingLeft: 20 }}>
                  <CheckListItem
                    configKey={'googleClientId'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'googleClientSecret'}
                    configItems={configItems}
                  />
                  <CheckListItem
                    configKey={'publicUrl'}
                    configItems={configItems}
                  />
                </ul>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <hr />
              <p>
                Some configuration is only accessible via environment variables
                or command-line-interface (CLI) flags. Below are the current
                values for these variables. Sensitive values are masked. Hover
                over input for additional information.
              </p>
              <hr />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <ConfigEnvDocumentation configItems={configItems} />
            </Col>
          </Row>
        </Content>
      </Layout>
    </AppNav>
  );
}

export default ConfigurationView;
