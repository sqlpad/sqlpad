import React from 'react';
import ButtonLink from '../common/ButtonLink';
import { resetNewQuery } from '../stores/editor-actions';

/**
 * This link leverages the redirect to generate a new sessionId
 */
function ToolbarNewQueryButton() {
  return (
    <ButtonLink
      variant="ghost"
      to="/queries/new"
      onClick={(e) => {
        // If user is trying to open another tab, let the browser do that
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.altKey ||
          e.shiftKey ||
          e.button ||
          e.defaultPrevented
        ) {
          return;
        }

        // Otherwise init a new query
        // User could be going from new to new query, and it needs to be reset via function call
        // We cannot rely on router to do this for us
        resetNewQuery();
      }}
    >
      New
    </ButtonLink>
  );
}

export default React.memo(ToolbarNewQueryButton);
