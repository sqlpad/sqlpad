import TagIcon from 'mdi-react/TagIcon';
import React from 'react';

export default function getAvailableSearchTags(tags) {
  return tags.sort().map((tag) => {
    return {
      id: tag,
      name: tag,
      component: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TagIcon size={14} style={{ marginRight: 4 }} />
          <span>{tag}</span>
        </span>
      ),
      tag,
    };
  });
}
