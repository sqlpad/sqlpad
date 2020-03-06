import AppHeaderButton from '../../common/AppHeaderButton';
import React, { useState } from 'react';
import QueryListDrawer from '../../queries/QueryListDrawer';

function QueryListButton() {
  const [showQueries, setShowQueries] = useState(false);

  return (
    <>
      <AppHeaderButton onClick={() => setShowQueries(true)}>
        Queries
      </AppHeaderButton>
      <QueryListDrawer
        visible={showQueries}
        onClose={() => setShowQueries(false)}
      />
    </>
  );
}

export default React.memo(QueryListButton);
