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

function getSortedFilteredQueries(queries, connections, searches) {
  const decoratedQueries = getDecoratedQueries(queries, connections);

  let filteredQueries = decoratedQueries;
  if (searches && searches.length) {
    searches.forEach(search => {
      if (search.createdBy) {
        filteredQueries = filteredQueries.filter(
          query => query.createdBy === search.createdBy
        );
      } else if (search.tag) {
        filteredQueries = filteredQueries.filter(
          query => query.tags && query.tags.includes(search.tag)
        );
      } else if (search.connectionId) {
        filteredQueries = filteredQueries.filter(
          query => query.connectionId === search.connectionId
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

  // For now sort by last modified
  filteredQueries = filteredQueries.sort((a, b) => {
    const aDate = a.modifiedDate || a.createdDate;
    const bDate = b.modifiedDate || b.createdDate;
    if (aDate < bDate) return 1;
    if (bDate < aDate) return -1;
    return 0;
  });

  return filteredQueries;
}

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
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1
  });

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const availableSearches = getAvailableSearchTags(queries, connections);

  const filteredQueries = getSortedFilteredQueries(
    queries,
    connections,
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
        onMouseLeave={() => setPreview('')}
        style={style}
      >
        <Link className={styles.queryLink} to={queryUrl} onClick={onClose}>
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
      onClose={onClose}
      placement="left"
    >
      <div className={styles.filterContainer}>
        <div className={styles.filterRow}>
          <Select
            style={{ width: 160, marginRight: 8 }}
            value=""
            onChange={e => console.log(e.target.value)}
          >
            <option>My queries</option>
            <option>Team's</option>
            <option>All</option>
          </Select>
          <Select
            style={{ marginRight: 8 }}
            value=""
            onChange={e => console.log(e.target.value)}
          >
            <option>something</option>
            <option>something2</option>
          </Select>

          <Select
            style={{ width: 180 }}
            value=""
            onChange={e => console.log(e.target.value)}
          >
            <option>Order by last saved</option>
            <option>Order by name</option>
          </Select>
        </div>

        <MultiSelect
          selectedItems={searches}
          options={availableSearches}
          onChange={items => setSearches(items)}
          placeholder="search queries"
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

export default connect(
  ['queries', 'connections'],
  store => ({
    loadQueries: loadQueries(store),
    deleteQuery: deleteQuery(store)
  })
)(React.memo(QueryListDrawer));
