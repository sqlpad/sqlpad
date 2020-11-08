import React from 'react';
import ButtonLink from '../common/ButtonLink';

/**
 * This link leverages the redirect to generate a new sessionId
 */
function ToolbarNewQueryButton() {
  return (
    <ButtonLink variant="ghost" to="/queries/new">
      New
    </ButtonLink>
  );
}

export default React.memo(ToolbarNewQueryButton);
