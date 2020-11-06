import React from 'react';
import ButtonLink from '../common/ButtonLink';
import { resetNewQuery } from '../stores/editor-actions';

/**
 * This component needs to reset the query on click because using the URL alone is not enough.
 * The query needs to reset on /queries/new -> /queries/new, and the onClick ensures that
 */
function ToolbarNewQueryButton() {
  return (
    <ButtonLink
      variant="ghost"
      to="/queries/new"
      onClick={() => {
        resetNewQuery();
      }}
    >
      New
    </ButtonLink>
  );
}

export default React.memo(ToolbarNewQueryButton);
