import Col from 'antd/lib/col';
import Layout from 'antd/lib/layout';
import message from 'antd/lib/message';
import Row from 'antd/lib/row';
import Form from 'antd/lib/form';

import debounce from 'lodash.debounce';
import React, { useState, useEffect, useContext } from 'react';
import AppNav from '../AppNav';
import fetchJson from '../utilities/fetch-json.js';
import ConfigItemInput from './ConfigItemInput';
import AppContext from '../containers/AppContext';

const { Content } = Layout;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 12 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 }
  }
};

function ConfigurationView() {
  const [configItems, setConfigItems] = useState([]);
  const appContext = useContext(AppContext);

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
      appContext.refreshAppContext();
    }
  }, 500);

  useEffect(() => {
    document.title = 'SQLPad - Configuration';
    loadConfigValuesFromServer();
  }, []);

  const uiConfigItems = configItems.filter(config => config.interface === 'ui');

  return (
    <AppNav>
      <Layout
        style={{ minHeight: '100vh' }}
        className="flex w-100 flex-column h-100"
      >
        <Content className="ma4">
          <div className="bg-white w-100 pa4">
            <Row gutter={16}>
              <Col span={14}>
                <Form {...formItemLayout}>
                  {uiConfigItems.map(config => (
                    <ConfigItemInput
                      key={config.key}
                      config={config}
                      saveConfigValue={saveConfigValue}
                    />
                  ))}
                </Form>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </AppNav>
  );
}

export default ConfigurationView;
