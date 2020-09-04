import TagsIcon from 'mdi-react/TagMultipleIcon';
import React, { useState } from 'react';
import IconButton from '../../common/IconButton';
import QueryTagsModal from './QueryTagsModal';

function ToolbarTagsButton() {
  const [showTags, setShowTags] = useState(false);

  return (
    <div>
      <IconButton tooltip="Tags" onClick={() => setShowTags(true)}>
        <TagsIcon />
      </IconButton>

      {/* @ts-expect-error ts-migrate(2322) FIXME: Property 'visible' does not exist on type 'Intrins... Remove this comment to see the full error message */}
      <QueryTagsModal visible={showTags} onClose={() => setShowTags(false)} />
    </div>
  );
}

export default ToolbarTagsButton;
