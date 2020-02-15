import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Measure from 'react-measure';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { connect } from 'unistore/react';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import Drawer from '../common/Drawer';
import ListItem from '../common/ListItem';
import MultiSelect from '../common/MultiSelect';
import Select from '../common/Select';
import Text from '../common/Text';
import { deleteQuery, loadQueries } from '../stores/queries';
import getAvailableSearchTags from './getAvailableSearchTags';
import getDecoratedQueries from './getDecoratedQueries';
import styles from './QueryList.module.css';
import QueryPreview from './QueryPreview';

function getSortedFilteredQueries(
  currentUser,
  queries,
  connections,
  creatorSearch,
  sort,
  connectionId,
  searches
) {
  let filteredQueries = getDecoratedQueries(queries, connections);

  if (creatorSearch !== 'ALL') {
    filteredQueries = filteredQueries.filter(query => {
      if (creatorSearch === 'MY_QUERIES') {
        return query.createdBy === currentUser.email;
      }
      if (creatorSearch === 'TEAMS') {
        return query.createdBy !== currentUser.email;
      }
      throw new Error(`Unknown creator search value ${creatorSearch}`);
    });
  }

  if (connectionId) {
    filteredQueries = filteredQueries.filter(query => {
      return query.connectionId === connectionId;
    });
  }

  if (searches && searches.length) {
    searches.forEach(search => {
      if (search.tag) {
        filteredQueries = filteredQueries.filter(
          query => query.tags && query.tags.includes(search.tag)
        );
      } else {
        // search is just open text search
        const lowerSearch = search.name.toLowerCase();
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

  filteredQueries = filteredQueries.sort((a, b) => {
    if (sort === 'SAVE_DATE') {
      const aDate = a.modifiedDate || a.createdDate;
      const bDate = b.modifiedDate || b.createdDate;
      if (aDate < bDate) return 1;
      if (bDate < aDate) return -1;
      return 0;
    }
    if (sort === 'NAME') {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName < bName) return -1;
      if (bName < aName) return 1;
      return 0;
    }
    throw new Error(`Unknown sort value ${sort}`);
  });

  return filteredQueries;
}

function QueryListDrawer({
  connections,
  currentUser,
  deleteQuery,
  loadQueries,
  onClose,
  queries,
  visible
}) {
  const [preview, setPreview] = useState(null);
  const [searches, setSearches] = useState([]);
  const [creatorSearch, setCreatorSearch] = useState('MY_QUERIES');
  const [sort, setSort] = useState('SAVE_DATE');
  const [connectionId, setConnectionId] = useState('');
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1
  });

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  function handleClose() {
    setPreview(null);
    onClose();
  }

  const availableSearches = getAvailableSearchTags(queries);

  const filteredQueries = getSortedFilteredQueries(
    currentUser,
    queries,
    connections,
    creatorSearch,
    sort,
    connectionId,
    searches
  );

  const Row = ({ index, style }) => {
    const query = filteredQueries[index];
    const tableUrl = `/query-table/${query._id}`;
    const chartUrl = `/query-chart/${query._id}`;
    const queryUrl = `/queries/${query._id}`;

    const hasChart =
      query && query.chartConfiguration && query.chartConfiguration.chartType;

    return (
      <ListItem
        key={query._id}
        className={styles.ListItem}
        onMouseEnter={() => setPreview(query)}
        onMouseLeave={() => setPreview(null)}
        style={style}
      >
        <Link className={styles.queryLink} to={queryUrl} onClick={handleClose}>
          {query.name}
          <br />
          <Text type="secondary">{query.connectionName}</Text>
        </Link>
        <div className={styles.listItemActions}>
          <Link
            className={styles.newWindowLink}
            to={tableUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            table <OpenInNewIcon size={16} />
          </Link>
          <div style={{ width: 8 }} />
          <Link
            className={styles.newWindowLink}
            to={chartUrl}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!Boolean(hasChart)}
          >
            chart <OpenInNewIcon size={16} />
          </Link>
          <DeleteConfirmButton
            icon
            key="del"
            confirmMessage={`Delete ${query.name}`}
            onConfirm={e => deleteQuery(query._id)}
          >
            Delete
          </DeleteConfirmButton>
        </div>
      </ListItem>
    );
  };

  // TODO: Move Measure and this vertical flex stuff into separate component
  // This was copied from schema sidebar
  return (
    <Drawer
      title={'Queries'}
      visible={visible}
      width="600px"
      onClose={handleClose}
      placement="left"
    >
      <div className={styles.filterContainer}>
        <div className={styles.filterRow}>
          <Select
            style={{ width: 140, marginRight: 8, flex: '0 0 auto' }}
            value={creatorSearch}
            onChange={e => setCreatorSearch(e.target.value)}
          >
            <option value="MY_QUERIES">My queries</option>
            <option value="TEAMS">Team's</option>
            <option value="ALL">All</option>
          </Select>
          <Select
            style={{ marginRight: 8 }}
            value={connectionId}
            onChange={e => setConnectionId(e.target.value)}
          >
            <option value="">All connections</option>
            {connections.map(connection => {
              return (
                <option key={connection._id} value={connection._id}>
                  {connection.name}
                </option>
              );
            })}
          </Select>

          <Select
            style={{ width: 170, flex: '0 0 auto' }}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="SAVE_DATE">Order by last saved</option>
            <option value="NAME">Order by name</option>
          </Select>
        </div>

        <MultiSelect
          selectedItems={searches}
          options={availableSearches}
          onChange={items => setSearches(items)}
          placeholder="search"
        />
      </div>

      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds);
        }}
      >
        {({ measureRef }) => (
          <div
            ref={measureRef}
            style={{
              display: 'flex',
              width: '100%',
              height: '100%'
            }}
          >
            <List
              // position absolute takes list out of flow,
              // preventing some weird react-measure behavior in Firefox
              style={{ position: 'absolute' }}
              height={dimensions.height}
              itemCount={filteredQueries.length}
              itemSize={60}
              width={dimensions.width}
              overscanCount={2}
            >
              {Row}
            </List>
          </div>
        )}
      </Measure>

      <QueryPreview query={preview} />
    </Drawer>
  );
}

QueryListDrawer.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  queries: PropTypes.array
};

export default connect(['queries', 'connections', 'currentUser'], store => ({
  loadQueries: loadQueries(store),
  deleteQuery: deleteQuery(store)
}))(React.memo(QueryListDrawer));
