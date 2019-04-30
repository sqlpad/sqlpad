import Drawer from '../../common/Drawer';
import Button from '../../common/Button';
import React, { useState } from 'react';
import QueryList from '../../queries/QueryList';

function QueryListButton() {
  const [showQueries, setShowQueries] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setShowQueries(true)}>
        Queries
      </Button>
      <Drawer
        title={'Queries'}
        visible={showQueries}
        width="600"
        onClose={() => setShowQueries(false)}
        placement="left"
      >
        <QueryList onSelect={() => setShowQueries(false)} />
      </Drawer>
    </>
  );
}

export default React.memo(QueryListButton);
