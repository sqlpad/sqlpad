import Table from 'antd/lib/table';
import React from 'react';

const { Column } = Table;

function ConfigEnvDocumentation({ configItems }) {
  const renderValue = (text, record) => {
    return record.value === '' ? '<empty>' : record.effectiveValue.toString();
  };

  const renderInfo = (text, record) => {
    return (
      <div style={{ width: '300px' }}>
        <p>{record.description}</p>
      </div>
    );
  };

  const renderCli = (text, record) => {
    const cliFlag =
      record.cliFlag && record.cliFlag.pop
        ? record.cliFlag.pop()
        : record.cliFlag;
    if (cliFlag) {
      return '--' + cliFlag;
    }
  };

  const filteredConfigItems = configItems.filter(
    config => config.interface === 'env'
  );

  return (
    <Table
      className="bg-white w-100"
      locale={{ emptyText: 'No connections found' }}
      dataSource={filteredConfigItems}
      pagination={false}
    >
      <Column title="Environment variable" key="envVar" dataIndex="envVar" />
      <Column title="Value" key="value" render={renderValue} />
      <Column title="CLI flag" key="cli" render={renderCli} />
      <Column title="Set by" key="setby" dataIndex="effectiveValueSource" />
      <Column title="Info" key="info" render={renderInfo} />
    </Table>
  );
}

export default ConfigEnvDocumentation;
