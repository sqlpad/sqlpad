import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useEffect, useState } from 'react';
import Measure from 'react-measure';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import Drawer from '../common/Drawer';
import ErrorBlock from '../common/ErrorBlock';
import InfoBlock from '../common/InfoBlock';
import Input from '../common/Input';
import ListItem from '../common/ListItem';
import message from '../common/message';
import MultiSelect from '../common/MultiSelect';
import Select from '../common/Select';
import SpinKitCube from '../common/SpinKitCube.js';
import Text from '../common/Text';
import fetchJson from '../utilities/fetch-json';
import swrFetcher from '../utilities/swr-fetcher';
import styles from './QueryList.module.css';
import QueryPreview from './QueryPreview';

const SHARED = 'SHARED';
const MY_QUERIES = 'MY_QUERIES';
const ALL = 'ALL';

function QueryListDrawer({ onClose, visible }) {
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [searchTags, setSearchTags] = useState([]);
  const [creatorSearch, setCreatorSearch] = useState(ALL);
  const [sort, setSort] = useState('SAVE_DATE');
  const [connectionId, setConnectionId] = useState('');
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1,
  });
  const [debouncedSearch] = useDebounce(search, 400);

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(null);
  const [error, setError] = useState(null);

  let params = {
    limit: 20,
  };

  if (sort === 'SAVE_DATE') {
    params.sortBy = '-updatedAt';
  } else {
    params.sortBy = '+name';
  }

  if (creatorSearch === MY_QUERIES) {
    params.ownedByUser = true;
  } else if (creatorSearch === SHARED) {
    params.ownedByUser = false;
  }

  if (debouncedSearch) {
    params.search = debouncedSearch;
  }

  if (connectionId) {
    params.connectionId = connectionId;
  }

  if (searchTags && searchTags.length > 0) {
    params.tags = searchTags.map((tag) => tag.id).sort();
  }

  const initialUrl =
    '/api/queries?' + queryString.stringify(params, { arrayFormat: 'bracket' });

  const getQueries = useCallback(
    (url) => {
      setLoading(true);
      fetchJson('GET', url).then((response) => {
        const { data, links, error } = response;
        setLoading(false);
        setError(error);
        if (links && links.next) {
          setNext(links.next.url);
        } else {
          setNext(null);
        }
        if (url === initialUrl) {
          setQueries(data);
        } else {
          setQueries((queries) => queries.concat(data));
        }
      });
    },
    [initialUrl]
  );

  // (re)fetch queries when visible
  // New queries may have been added since last viewing
  useEffect(() => {
    if (visible) {
      getQueries(initialUrl);
    }
  }, [visible, initialUrl, getQueries]);

  let { data: tagsRes } = useSWR('/api/tags', swrFetcher);
  const tags = tagsRes ? tagsRes.data : [];

  let { data: connectionsRes } = useSWR('/api/connections', swrFetcher);
  const connections = connectionsRes ? connectionsRes.data : [];

  const deleteQuery = async (queryId) => {
    const { error } = await fetchJson('DELETE', `/api/queries/${queryId}`);
    if (error) {
      return message.error(error);
    }
    setQueries((queries) => queries.filter((q) => q.id !== queryId));
    setPreview(null);
  };

  function handleClose() {
    setPreview(null);
    onClose();
  }

  const Row = ({ index, style }) => {
    const query = queries[index];
    const tableUrl = `/query-table/${query.id}`;
    const chartUrl = `/query-chart/${query.id}`;
    const queryUrl = `/queries/${query.id}`;

    const hasChart = query && query.chart && query.chart.chartType;

    return (
      <ListItem
        key={query.id}
        className={styles.ListItem}
        onMouseEnter={() => setPreview(query)}
        onMouseLeave={() => setPreview(null)}
        style={style}
      >
        <Link className={styles.queryLink} to={queryUrl} onClick={handleClose}>
          {query.name}
          <br />
          <Text type="secondary">{query.connection.name}</Text>
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
          <div style={{ width: 4 }} />
          <DeleteConfirmButton
            icon
            key="del"
            confirmMessage={`Delete ${query.name}`}
            onConfirm={(e) => deleteQuery(query.id)}
            disabled={!query.canDelete}
          >
            Delete
          </DeleteConfirmButton>
        </div>
      </ListItem>
    );
  };

  const loadMore = () => {
    if (!loading && next) {
      getQueries(next);
    }
  };

  return (
    <Drawer
      title={'Queries'}
      visible={visible}
      width="600px"
      onClose={handleClose}
      placement="left"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={styles.filterContainer}>
          <div className={styles.filterRow}>
            <Select
              style={{ width: 140, marginRight: 8, flex: '0 0 auto' }}
              value={creatorSearch}
              onChange={(e) => setCreatorSearch(e.target.value)}
            >
              <option value={MY_QUERIES}>My queries</option>
              <option value={SHARED}>Shared with me</option>
              <option value={ALL}>All queries</option>
            </Select>
            <Select
              style={{ marginRight: 8 }}
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
            >
              <option value="">All connections</option>
              {connections.map((connection) => {
                return (
                  <option key={connection.id} value={connection.id}>
                    {connection.name}
                  </option>
                );
              })}
            </Select>

            <Select
              style={{ width: 170, flex: '0 0 auto' }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="SAVE_DATE">Order by last saved</option>
              <option value="NAME">Order by name</option>
            </Select>
          </div>
          <div className={styles.filterRow}>
            <div style={{ flex: '1 1 auto', width: '50%' }}>
              <Input
                style={{ height: 36 }}
                placeholder="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: 8 }} />
            <div style={{ flex: '1 1 auto', width: '50%' }}>
              <MultiSelect
                selectedItems={searchTags}
                options={tags.map((t) => ({ id: t, name: t }))}
                onChange={(items) => setSearchTags(items)}
                placeholder="tags"
              />
            </div>
          </div>
        </div>

        <Measure
          bounds
          onResize={(contentRect) => {
            setDimensions(contentRect.bounds);
          }}
        >
          {({ measureRef }) => (
            <div
              ref={measureRef}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
              }}
            >
              {loading && queries.length === 0 && (
                <div className="h-100 w-100 flex-center">
                  <SpinKitCube />
                </div>
              )}
              {error && <ErrorBlock>Error getting queries</ErrorBlock>}
              {!error && !loading && queries.length === 0 && (
                <div style={{ height: 150, width: '100%' }}>
                  <InfoBlock>No queries found</InfoBlock>
                </div>
              )}
              {!error && queries.length > 0 && (
                <InfiniteLoader
                  isItemLoaded={(index) => index < queries.length}
                  itemCount={1000}
                  loadMoreItems={loadMore}
                >
                  {({ onItemsRendered, ref }) => (
                    <List
                      // position absolute takes list out of flow,
                      // preventing some weird react-measure behavior in Firefox
                      style={{ position: 'absolute' }}
                      ref={ref}
                      onItemsRendered={onItemsRendered}
                      height={dimensions.height}
                      itemCount={queries.length}
                      itemSize={60}
                      width={dimensions.width}
                      overscanCount={2}
                    >
                      {Row}
                    </List>
                  )}
                </InfiniteLoader>
              )}
            </div>
          )}
        </Measure>

        <QueryPreview key={preview && preview.id} query={preview} />
      </div>
    </Drawer>
  );
}

QueryListDrawer.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default React.memo(QueryListDrawer);
