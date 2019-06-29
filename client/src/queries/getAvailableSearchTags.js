import uniq from 'lodash/uniq';
import TagIcon from 'mdi-react/TagIcon';
import React from 'react';

export default function getAvailableSearchTags(queries) {
  const tags = uniq(
    queries
      .map(q => q.tags)
      .reduce((a, b) => a.concat(b), [])
      .filter(tag => Boolean(tag))
  ).map(tag => {
    return {
      id: tag,
      name: tag,
      component: (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TagIcon size={14} style={{ marginRight: 4 }} />
          <span>{tag}</span>
        </span>
      ),
      tag
    };
  });

  return tags.sort();
}
