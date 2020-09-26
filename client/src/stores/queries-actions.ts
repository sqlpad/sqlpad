import { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';
import message from '../common/message';
import baseUrl from '../utilities/baseUrl';
import { api } from '../utilities/fetch-json';
import {
  removeLocalQueryText,
  setLocalQueryText,
} from '../utilities/localQueryText';
import runQueryViaBatch from '../utilities/runQueryViaBatch';
import { NEW_QUERY, useQueriesStore } from './queries-store';
import { useConnectionsStore } from './connections-store';

export const formatQuery = async () => {
  const { query } = useQueriesStore.getState();

  const json = await api.post('/api/format-sql', {
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

  useQueriesStore.setState({
    query: { ...query, queryText: json.data.query },
    unsavedChanges: true,
  });
};

export const loadQuery = async (queryId: string) => {
  const { error, data } = await api.get(`/api/queries/${queryId}`);
  if (error) {
    return message.error('Query not found');
  }

  useConnectionsStore.setState({
    selectedConnectionId: data.connectionId,
  });

  useQueriesStore.setState({
    runQueryInstanceId: null,
    isRunning: false,
    query: data,
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false,
  });
};

export const runQuery = async () => {
  const { query, selectedText } = useQueriesStore.getState();
  const {
    selectedConnectionId,
    connectionClient,
  } = useConnectionsStore.getState();

  // multiple queries could be running and we only want to keep the "current" or latest query run
  const runQueryInstanceId = uuidv4();

  useQueriesStore.setState({
    runQueryInstanceId,
    isRunning: true,
    runQueryStartTime: new Date(),
  });

  const postData = {
    connectionId: selectedConnectionId,
    connectionClientId: connectionClient && connectionClient.id,
    queryId: query.id,
    name: query.name,
    batchText: query.queryText,
    selectedText,
    chart: query.chart,
  };

  const { data, error } = await runQueryViaBatch(postData);

  // Get latest state and check runQueryInstanceId to ensure it matches
  // If it matches another query has not been run and we can keep the result.
  // Not matching implies another query has been executed and we can ignore this result.
  if (useQueriesStore.getState().runQueryInstanceId === runQueryInstanceId) {
    useQueriesStore.setState({
      isRunning: false,
      queryError: error,
      queryResult: data,
    });
  }
};

export const saveQuery = async () => {
  const { query } = useQueriesStore.getState();
  const { selectedConnectionId } = useConnectionsStore.getState();

  if (!query.name) {
    message.error('Query name required');
    useQueriesStore.setState({ showValidation: true });
    return;
  }

  useQueriesStore.setState({ isSaving: true });
  const queryData = Object.assign({}, query, {
    connectionId: selectedConnectionId,
  });

  if (query.id) {
    api.put(`/api/queries/${query.id}`, queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        message.error(error);
        useQueriesStore.setState({ isSaving: false });
        return;
      }
      mutate('/api/queries');
      message.success('Query Saved');
      removeLocalQueryText(data.id);
      useQueriesStore.setState({
        isSaving: false,
        unsavedChanges: false,
        query: data,
      });
    });
  } else {
    api.post(`/api/queries`, queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        message.error(error);
        useQueriesStore.setState({ isSaving: false });
        return;
      }
      mutate('/api/queries');
      window.history.replaceState(
        {},
        data.name,
        `${baseUrl()}/queries/${data.id}`
      );
      message.success('Query Saved');
      removeLocalQueryText(data.id);
      useQueriesStore.setState({
        isSaving: false,
        unsavedChanges: false,
        query: data,
      });
    });
  }
};

export const handleCloneClick = () => {
  const { query } = useQueriesStore.getState();
  delete query.id;
  const name = 'Copy of ' + query.name;
  window.history.replaceState({}, name, `${baseUrl()}/queries/new`);
  useQueriesStore.setState({ query: { ...query, name }, unsavedChanges: true });
};

export const resetNewQuery = () => {
  useQueriesStore.setState({
    runQueryInstanceId: null,
    isRunning: false,
    query: Object.assign({}, NEW_QUERY),
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false,
  });
};

export const setQueryState = (field: any, value: any) => {
  const { query } = useQueriesStore.getState();
  if (field === 'queryText') {
    setLocalQueryText(query.id, value);
  }
  useQueriesStore.setState({
    query: { ...query, [field]: value },
    unsavedChanges: true,
  });
};

export const handleChartConfigurationFieldsChange = (
  chartFieldId: any,
  queryResultField: any
) => {
  const { query } = useQueriesStore.getState();
  const { fields } = query.chart;
  useQueriesStore.setState({
    query: {
      ...query,
      chart: {
        ...query.chart,
        fields: { ...fields, [chartFieldId]: queryResultField },
      },
    },
    unsavedChanges: true,
  });
};

export const handleChartTypeChange = (chartType: any) => {
  const { query } = useQueriesStore.getState();
  useQueriesStore.setState({
    query: {
      ...query,
      chart: { ...query.chart, chartType },
    },
    unsavedChanges: true,
  });
};

export const handleQuerySelectionChange = (selectedText: any) => {
  useQueriesStore.setState({ selectedText });
};
