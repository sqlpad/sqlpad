import Button from '../common/Button';
import React, { useState } from 'react';
import QueryListDrawer from '../queries/QueryListDrawer';

function QueryListButton() {
  const [showQueries, setShowQueries] = useState(false);

  return (
    <>
      <Button variant="ghost" onClick={() => setShowQueries(true)}>
        Queries
      </Button>
      <QueryListDrawer
        visible={showQueries}
        onClose={() => setShowQueries(false)}
      />
    </>
  );
}

export default React.memo(QueryListButton);
