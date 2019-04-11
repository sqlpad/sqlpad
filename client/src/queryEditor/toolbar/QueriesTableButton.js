import Button from 'antd/lib/button';
import Drawer from 'antd/lib/drawer';
import React, { useState } from 'react';
import QueriesTable from '../../queries/QueriesTable';

function QueriesTableButton({}) {
  const [showQueries, setShowQueries] = useState(false);

  return (
    <>
      <Button icon="file-text" onClick={() => setShowQueries(true)} />
      <Drawer
        title={'Queries'}
        visible={showQueries}
        height="90%"
        destroyOnClose={true}
        onClose={() => setShowQueries(false)}
        placement="bottom"
        bodyStyle={{
          backgroundColor: '#f0f2f5',
          height: 'calc(90vh - 55px)',
          overflow: 'auto'
        }}
      >
        <QueriesTable />
      </Drawer>
    </>
  );
}

export default React.memo(QueriesTableButton);
