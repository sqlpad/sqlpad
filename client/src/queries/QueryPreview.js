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

  let userReference = query.createdBy;
  if (query.createdByUser) {
    userReference = query.createdByUser.name || query.createdByUser.email;
  }

  const connectionName = query.connection && query.connection.name;

  return (
    <div className={styles.preview}>
      <div>
        <div className={styles.previewQueryName}>{query.name}</div>
        <div>Connection {connectionName}</div>
        <div>By {userReference}</div>
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
