import { v4 as uuidv4 } from 'uuid';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import {
  setLocalQueryText,
  removeLocalQueryText,
} from '../utilities/localQueryText';

const ONE_HOUR_MS = 1000 * 60 * 60;

export const NEW_QUERY = {
  id: '',
  name: '',
  tags: [],
  connectionId: '',
  queryText: '',
  chart: {
    chartType: '',
    fields: {}, // key value for chart
  },
  canRead: true,
  canWrite: true,
  canDelete: true,
};

export const initialState = {
  cacheKey: uuidv4(),
  isRunning: false,
  isSaving: false,
  queries: [],
  query: Object.assign({}, NEW_QUERY),
  queryError: undefined,
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  showValidation: false,
  unsavedChanges: false,
};

export const formatQuery = async (state) => {
  const { query } = state;

  const json = await fetchJson('POST', '/api/format-sql', {
    query: query.queryText,
  });

  if (json.error) {
    message.error(json.error);
    return;
  }

  if (!json.data || !json.data.query) {
    console.warn('unexpected API result');
    return;
  }

  setLocalQueryText(query.id, json.data.query);

  return {
    query: { ...query, queryText: json.data.query },
    unsavedChanges: true,
  };
};

export const loadQueries = (store) => async (state) => {
  const { queriesLastUpdated, queries } = state;
  if (
    !queries.length ||
    (queriesLastUpdated && new Date() - queriesLastUpdated > ONE_HOUR_MS)
  ) {
    store.setState({ queriesLoading: true });
    const json = await fetchJson('GET', '/api/queries');
    if (json.error) {
      message.error(json.error);
    }
    store.setState({
      queriesLoading: false,
      queriesLastUpdated: new Date(),
      queries: json.data || [],
    });
  }
};

export const clearQueries = () => {
  return { queries: [] };
};

export const deleteQuery = (store) => async (state, queryId) => {
  const { queries } = state;
  const filteredQueries = queries.filter((q) => {
    return q.id !== queryId;
  });
  store.setState({ queries: filteredQueries });
  const json = await fetchJson('DELETE', '/api/queries/' + queryId);
  if (json.error) {
    message.error(json.error);
    store.setState({ queries });
  }
};

export const loadQuery = async (state, queryId) => {
  const { error, data } = await fetchJson('GET', `/api/queries/${queryId}`);
  if (error) {
    message.error(error);
  }
  return {
    query: data,
    queryError: undefined,
    queryResult: undefined,
    selectedConnectionId: data.connectionId,
    unsavedChanges: false,
  };
};

export const runQuery = (store) => async (state) => {
  const {
    cacheKey,
    query,
    selectedText,
    selectedConnectionId,
    connectionClient,
  } = state;

  store.setState({
    isRunning: true,
    runQueryStartTime: new Date(),
  });
  const postData = {
    connectionId: selectedConnectionId,
    connectionClientId: connectionClient && connectionClient.id,
    cacheKey,
    queryId: query.id,
    queryName: query.name,
    queryText: selectedText || query.queryText,
  };
  const { data, error } = await fetchJson(
    'POST',
    '/api/query-result',
    postData
  );
  store.setState({
    isRunning: false,
    queryError: error,
    queryResult: data,
  });
};

export const saveQuery = (store) => async (state) => {
  const { query, selectedConnectionId } = state;
  if (!query.name) {
    message.error('Query name required');
    store.setState({ showValidation: true });
    return;
  }
  store.setState({ isSaving: true });
  const queryData = Object.assign({}, query, {
    connectionId: selectedConnectionId,
  });
  if (query.id) {
    fetchJson('PUT', `/api/queries/${query.id}`, queryData).then((json) => {
      const { error, data } = json;
      const { queries } = store.getState();
      if (error) {
        message.error(error);
        store.setState({ isSaving: false });
        return;
      }
      message.success('Query Saved');
      removeLocalQueryText(data.id);
      const updatedQueries = queries.map((q) => {
        return q.id === data.id ? data : q;
      });
      store.setState({
        isSaving: false,
        unsavedChanges: false,
        query: data,
        queries: updatedQueries,
      });
    });
  } else {
    fetchJson('POST', `/api/queries`, queryData).then((json) => {
      const { error, data } = json;
      const { queries } = store.getState();
      if (error) {
        message.error(error);
        store.setState({ isSaving: false });
        return;
      }
      window.history.replaceState(
        {},
        data.name,
        `${window.BASE_URL}/queries/${data.id}`
      );
      message.success('Query Saved');
      removeLocalQueryText(data.id);
      store.setState({
        isSaving: false,
        unsavedChanges: false,
        query: data,
        queries: [data].concat(queries),
      });
    });
  }
};

export const handleCloneClick = (state) => {
  const { query } = state;
  delete query.id;
  const name = 'Copy of ' + query.name;
  window.history.replaceState({}, name, `${window.BASE_URL}/queries/new`);
  return { query: { ...query, name }, unsavedChanges: true };
};

export const resetNewQuery = (state) => {
  return {
    query: Object.assign({}, NEW_QUERY),
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false,
  };
};

export const setQueryState = (state, field, value) => {
  const { query } = state;
  if (field === 'queryText') {
    setLocalQueryText(query.id, value);
  }
  return { query: { ...query, [field]: value }, unsavedChanges: true };
};

export const handleChartConfigurationFieldsChange = (
  state,
  chartFieldId,
  queryResultField
) => {
  const { query } = state;
  const { fields } = query.chart;
  return {
    query: {
      ...query,
      chart: {
        ...query.chart,
        fields: { ...fields, [chartFieldId]: queryResultField },
      },
    },
    unsavedChanges: true,
  };
};

export const handleChartTypeChange = (state, chartType) => {
  const { query } = state;
  return {
    query: {
      ...query,
      chart: { ...query.chart, chartType },
    },
    unsavedChanges: true,
  };
};

export const handleQuerySelectionChange = (state, selectedText) => {
  return { selectedText };
};

export default {
  clearQueries,
  deleteQuery,
  formatQuery,
  handleChartConfigurationFieldsChange,
  handleChartTypeChange,
  handleCloneClick,
  handleQuerySelectionChange,
  initialState,
  loadQueries,
  loadQuery,
  resetNewQuery,
  runQuery,
  saveQuery,
  setQueryState,
};
