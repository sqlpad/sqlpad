import Button from 'antd/lib/button';
import Drawer from 'antd/lib/drawer';
import React, { useState } from 'react';
import QueryList from '../../queries/QueryList';

function QueriesTableButton() {
  const [showQueries, setShowQueries] = useState(false);

  return (
    <>
      <Button icon="file-text" onClick={() => setShowQueries(true)}>
        Queries
      </Button>
      <Drawer
        title={'Queries'}
        visible={showQueries}
        width="600"
        destroyOnClose={true}
        onClose={() => setShowQueries(false)}
        placement="left"
        bodyStyle={{
          height: 'calc(90vh - 55px)',
          overflow: 'auto'
        }}
      >
        <QueryList onSelect={() => setShowQueries(false)} />
      </Drawer>
    </>
  );
}

export default React.memo(QueriesTableButton);
