import createStore from 'unistore';
import uuid from 'uuid';
import message from 'antd/lib/message';
import sqlFormatter from 'sql-formatter';
import fetchJson from '../utilities/fetch-json.js';

const NEW_QUERY = {
  _id: '',
  name: '',
  tags: [],
  connectionId: '',
  queryText: '',
  chartConfiguration: {
    chartType: '',
    fields: {} // key value for chart
  }
};

export const unistoreStore = createStore({
  activeTabKey: 'sql',
  availableTags: [],
  cacheKey: uuid.v1(),
  isRunning: false,
  isSaving: false,
  query: Object.assign({}, NEW_QUERY),
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  showModal: false,
  showValidation: false,
  unsavedChanges: false
});

// If actions is a function, it gets passed the store:
// Actions receive current state as first parameter and any other params next
// Actions can just return a state update:
export const actions = store => ({
  formatQuery(state) {
    const { query } = state;
    return {
      query: { ...query, queryText: sqlFormatter.format(query.queryText) },
      unsavedChanges: true
    };
  },

  async loadQuery(state, queryId, selectConnection) {
    if (typeof selectConnection !== 'function') {
      throw new Error('expected selectConnection function');
    }

    const { error, query } = await fetchJson('GET', `/api/queries/${queryId}`);
    if (error) {
      message.error(error);
    }
    selectConnection(query.connectionId);
    return { query };
  },

  async loadTags(state) {
    const { error, tags } = await fetchJson('GET', '/api/tags');
    if (error) {
      message.error(error);
    }
    return { availableTags: tags };
  },

  async runQuery(state, selectedConnectionId) {
    if (!selectedConnectionId) {
      throw new Error('expected selectedConnectionId');
    }
    const { cacheKey, query, selectedText } = state;

    store.setState({
      isRunning: true,
      runQueryStartTime: new Date()
    });
    const postData = {
      connectionId: selectedConnectionId,
      cacheKey,
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
  },

  saveQuery(state, selectedConnectionId) {
    if (!selectedConnectionId) {
      throw new Error('missing selectedConnectionId');
    }
    const { query } = state;
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
        if (error) {
          message.error(error);
          store.setState({ isSaving: false });
          return;
        }
        message.success('Query Saved');
        store.setState({ isSaving: false, unsavedChanges: false, query });
      });
    } else {
      fetchJson('POST', `/api/queries`, queryData).then(json => {
        const { error, query } = json;
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
        store.setState({ isSaving: false, unsavedChanges: false, query });
      });
    }
  },

  handleCloneClick(state) {
    const { query } = state;
    delete query._id;
    const name = 'Copy of ' + query.name;
    window.history.replaceState({}, name, `${window.BASE_URL}/queries/new`);
    return { query: { ...query, name }, unsavedChanges: true };
  },

  resetNewQuery(state) {
    return {
      activeTabKey: 'sql',
      queryResult: undefined,
      query: Object.assign({}, NEW_QUERY),
      unsavedChanges: false
    };
  },

  setQueryState(state, field, value) {
    const { query } = state;
    return { query: { ...query, [field]: value }, unsavedChanges: true };
  },

  handleChartConfigurationFieldsChange(state, chartFieldId, queryResultField) {
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
  },

  handleChartTypeChange(state, chartType) {
    const { query } = state;
    return {
      query: {
        ...query,
        chartConfiguration: { ...query.chartConfiguration, chartType }
      },
      unsavedChanges: true
    };
  },

  handleModalHide() {
    return { showModal: false };
  },

  handleMoreClick() {
    return { showModal: true };
  },

  handleQuerySelectionChange(store, selectedText) {
    return { selectedText };
  },

  handleTabSelect(store, event) {
    return { activeTabKey: event.target.value };
  }
});
