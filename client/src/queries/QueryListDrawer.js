import ChartIcon from 'mdi-react/FinanceIcon';
import TableIcon from 'mdi-react/TableIcon';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'unistore/react';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import Divider from '../common/Divider';
import Drawer from '../common/Drawer';
import IconButtonLink from '../common/IconButtonLink';
import ListItem from '../common/ListItem';
import Select from '../common/Select';
import SqlEditor from '../common/SqlEditor';
import Text from '../common/Text';
import Tooltip from '../common/Tooltip';
import { actions } from '../stores/unistoreStore';
import getAvailableSearchTags from './getAvailableSearchTags';
import getDecoratedQueries from './getDecoratedQueries';
import styles from './QueryList.module.css';

function QueryListDrawer({
  queries,
  loadQueries,
  connections,
  deleteQuery,
  visible,
  onClose
}) {
  const [preview, setPreview] = useState('');
  const [searches, setSearches] = useState([]);
  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const availableSearches = getAvailableSearchTags(queries, connections);
  const decoratedQueries = getDecoratedQueries(queries, connections);

  let filteredQueries = decoratedQueries;
  if (searches && searches.length) {
    searches.forEach(search => {
      if (search.startsWith('createdBy=')) {
        const createdBy = search.substring(10);
        filteredQueries = filteredQueries.filter(
          query => query.createdBy === createdBy
        );
      } else if (search.startsWith('tag=')) {
        const sTag = search.substring(4);
        filteredQueries = filteredQueries.filter(
          query => query.tags && query.tags.includes(sTag)
        );
      } else if (search.startsWith('connection=')) {
        const connectionName = search.substring(11);
        filteredQueries = filteredQueries.filter(
          query => query.connectionName === connectionName
        );
      } else {
        // search is just open text search
        const lowerSearch = search.toLowerCase();
        filteredQueries = filteredQueries.filter(q => {
          return (
            (q.name && q.name.toLowerCase().search(lowerSearch) !== -1) ||
            (q.queryText &&
              q.queryText.toLowerCase().search(lowerSearch) !== -1)
          );
        });
      }
    });
  }

  // TODO FIXME XXX searches select is meant to be multi value + open text string!
  // Figure out what to do about this later after antd removal
  return (
    <Drawer
      title={'Queries'}
      visible={visible}
      width="600px"
      onClose={onClose}
      placement="left"
    >
      <div>
        <Select
          autoFocus
          className="w-100"
          value={searches && searches[0]}
          onChange={event => setSearches([event.target.value])}
        >
          <option value="" />
          {availableSearches.map(search => (
            <option key={search}>{search}</option>
          ))}
        </Select>
      </div>
      {filteredQueries.map(query => {
        const tableUrl = `/query-table/${query._id}`;
        const chartUrl = `/query-chart/${query._id}`;
        const queryUrl = `/queries/${query._id}`;

        const actions = [
          <Tooltip key="table" label="Open results in new window">
            <IconButtonLink
              to={tableUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TableIcon />
            </IconButtonLink>
          </Tooltip>,
          <Tooltip key="chart" label="Open chart in new window">
            <IconButtonLink
              to={chartUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ChartIcon />
            </IconButtonLink>
          </Tooltip>,
          <DeleteConfirmButton
            key="del"
            confirmMessage="Delete query?"
            onConfirm={e => deleteQuery(query._id)}
          >
            Delete
          </DeleteConfirmButton>
        ];

        return (
          <ListItem
            key={query._id}
            className={styles.ListItem + ' ' + styles.outlined}
            onMouseEnter={() => setPreview(query)}
            onMouseLeave={() => setPreview('')}
            style={{ position: 'relative' }}
          >
            <Link
              style={{ flexGrow: 1, padding: 8 }}
              className={styles.outlined}
              to={queryUrl}
              onClick={onClose}
            >
              {query.name}
              <br />
              <Text type="secondary">{query.connectionName}</Text>
            </Link>
            <div
              style={{
                position: 'absolute',
                right: 8,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {actions}
            </div>
          </ListItem>
        );
      })}

      {preview && (
        <div
          style={{
            position: 'fixed',
            left: 640,
            top: 40,
            right: 40,
            bottom: 40,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 8px 2px rgba( 0, 0, 0, .2 )',
            padding: 16
          }}
        >
          <div style={{ fontSize: '1.25rem' }}>{preview.name}</div>
          <div>Connection {preview.connectionName}</div>
          <div>By {preview.createdBy}</div>
          <div>
            {preview.tags &&
              preview.tags.map(tag => (
                // TODO FIXME XXX make better tags
                <span
                  style={{
                    padding: '0 8px',
                    marginRight: 4,
                    marginTop: 4,
                    backgroundColor: '#EEE',
                    border: '1px solid #CCC'
                  }}
                  key={tag}
                >
                  {tag}
                </span>
              ))}
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
              display: 'flex'
            }}
          >
            <SqlEditor readOnly value={preview.queryText} />
          </div>
        </div>
      )}
    </Drawer>
  );
}

QueryListDrawer.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  queries: PropTypes.array
};

export default connect(
  ['queries', 'connections'],
  actions
)(React.memo(QueryListDrawer));
