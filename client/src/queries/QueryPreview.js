import PropTypes from 'prop-types';
import React from 'react';
import Divider from '../common/Divider';
import SqlEditor from '../common/SqlEditor';
import Tag from '../common/Tag';
import styles from './QueryPreview.module.css';

function QueryPreview({ query }) {
  if (!query) {
    return null;
  }

  return (
    <div className={styles.preview}>
      <div>
        <div className={styles.previewQueryName}>{query.name}</div>
        <div>Connection {query.connectionName}</div>
        <div>By {query.createdBy}</div>
        <div>
          {query.tags && query.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </div>
      </div>

      <Divider />

      {/* 
        This style necessary to get proper sizing on SqlEditor.
        It has height 100%, which looks to height of nearest containing BLOCK,
        which apparently looks past this flex container. This causes weirdness
      */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <SqlEditor readOnly value={query.queryText || ''} />
      </div>
    </div>
  );
}

QueryPreview.propTypes = {
  query: PropTypes.object,
};

export default QueryPreview;
