import uuid from 'uuid';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import {
  setLocalQueryText,
  removeLocalQueryText
} from '../utilities/localQueryText';

const ONE_HOUR_MS = 1000 * 60 * 60;

export const NEW_QUERY = {
  _id: '',
  name: '',
  tags: [],
  connectionId: '',
  queryText: '',
  chartConfiguration: {
    chartType: '',
    fields: {} // key value for chart
  },
  canRead: true,
  canWrite: true,
  canDelete: true
};

export const initialState = {
  cacheKey: uuid.v4(),
  isRunning: false,
  isSaving: false,
  queries: [],
  query: Object.assign({}, NEW_QUERY),
  queryError: undefined,
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  showValidation: false,
  unsavedChanges: false
};

export const formatQuery = async state => {
  const { query } = state;

  const json = await fetchJson('POST', '/api/format-sql', {
    query: query.queryText
  });

  if (json.error) {
    message.error(json.error);
    return;
  }

  setLocalQueryText(query._id, json.query);

  return {
    query: { ...query, queryText: json.query },
    unsavedChanges: true
  };
};

export const loadQueries = store => async state => {
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
      queries: json.queries || []
    });
  }
};

export const clearQueries = () => {
  return { queries: [] };
};

export const deleteQuery = store => async (state, queryId) => {
  const { queries } = state;
  const filteredQueries = queries.filter(q => {
    return q._id !== queryId;
  });
  store.setState({ queries: filteredQueries });
  const json = await fetchJson('DELETE', '/api/queries/' + queryId);
  if (json.error) {
    message.error(json.error);
    store.setState({ queries });
  }
};

export const loadQuery = async (state, queryId) => {
  const { error, query } = await fetchJson('GET', `/api/queries/${queryId}`);
  if (error) {
    message.error(error);
  }
  return {
    query,
    queryError: undefined,
    queryResult: undefined,
    selectedConnectionId: query.connectionId,
    unsavedChanges: false
  };
};

export const runQuery = store => async state => {
  const { cacheKey, query, selectedText, selectedConnectionId } = state;

  store.setState({
    isRunning: true,
    runQueryStartTime: new Date()
  });
  const postData = {
    connectionId: selectedConnectionId,
    cacheKey,
    queryId: query._id,
    queryName: query.name,
    queryText: selectedText || query.queryText
  };
  const { queryResult, error } = await fetchJson(
    'POST',
    '/api/query-result',
    postData
  );
  if (error) {
    message.error(error);
  }
  store.setState({
    isRunning: false,
    queryError: error,
    queryResult
  });
};

export const saveQuery = store => async state => {
  const { query, selectedConnectionId } = state;
  if (!query.name) {
    message.error('Query name required');
    store.setState({ showValidation: true });
    return;
  }
  store.setState({ isSaving: true });
  const queryData = Object.assign({}, query, {
    connectionId: selectedConnectionId
  });
  if (query._id) {
    fetchJson('PUT', `/api/queries/${query._id}`, queryData).then(json => {
      const { error, query } = json;
      const { queries } = store.getState();
      if (error) {
        message.error(error);
        store.setState({ isSaving: false });
        return;
      }
      message.success('Query Saved');
      removeLocalQueryText(query._id);
      const updatedQueries = queries.map(q => {
        return q._id === query._id ? query : q;
      });
      store.setState({
        isSaving: false,
        unsavedChanges: false,
        query,
        queries: updatedQueries
      });
    });
  } else {
    fetchJson('POST', `/api/queries`, queryData).then(json => {
      const { error, query } = json;
      const { queries } = store.getState();
      if (error) {
        message.error(error);
        store.setState({ isSaving: false });
        return;
      }
      window.history.replaceState(
        {},
        query.name,
        `${window.BASE_URL}/queries/${query._id}`
      );
      message.success('Query Saved');
      removeLocalQueryText(query._id);
      store.setState({
        isSaving: false,
        unsavedChanges: false,
        query,
        queries: [query].concat(queries)
      });
    });
  }
};

export const handleCloneClick = state => {
  const { query } = state;
  delete query._id;
  const name = 'Copy of ' + query.name;
  window.history.replaceState({}, name, `${window.BASE_URL}/queries/new`);
  return { query: { ...query, name }, unsavedChanges: true };
};

export const resetNewQuery = state => {
  return {
    query: Object.assign({}, NEW_QUERY),
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false
  };
};

export const setQueryState = (state, field, value) => {
  const { query } = state;
  if (field === 'queryText') {
    setLocalQueryText(query._id, value);
  }
  return { query: { ...query, [field]: value }, unsavedChanges: true };
};

export const handleChartConfigurationFieldsChange = (
  state,
  chartFieldId,
  queryResultField
) => {
  const { query } = state;
  const { fields } = query.chartConfiguration;
  return {
    query: {
      ...query,
      chartConfiguration: {
        ...query.chartConfiguration,
        fields: { ...fields, [chartFieldId]: queryResultField }
      }
    },
    unsavedChanges: true
  };
};

export const handleChartTypeChange = (state, chartType) => {
  const { query } = state;
  return {
    query: {
      ...query,
      chartConfiguration: { ...query.chartConfiguration, chartType }
    },
    unsavedChanges: true
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
  setQueryState
};
