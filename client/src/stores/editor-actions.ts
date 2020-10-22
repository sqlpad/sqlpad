import localforage from 'localforage';
import queryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import message from '../common/message';
import baseUrl from '../utilities/baseUrl';
import { api } from '../utilities/api';
import {
  removeLocalQueryText,
  setLocalQueryText,
} from '../utilities/localQueryText';
import runQueryViaBatch from '../utilities/runQueryViaBatch';
import updateCompletions from '../utilities/updateCompletions';
import { SchemaState, useEditorStore, EditorSession } from './editor-store';
import { AppInfo, Connection, ChartFields, ACLRecord } from '../types';

export const initApp = async (
  config: AppInfo['config'],
  connections: Connection[]
) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    const update: { initialized: boolean; selectedConnectionId?: string } = {
      initialized: true,
    };

    if (connections.length === 1) {
      update.selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c) => c.id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          update.selectedConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c) => c.id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
          update.selectedConnectionId = selectedConnectionId;
        }
      }

      const qs = queryString.parse(window.location.search);
      const qsConnectionName = qs.connectionName;
      if (qsConnectionName) {
        const selectedConnection = connections.find(
          (c) => c.name === qsConnectionName
        );
        if (Boolean(selectedConnection)) {
          update.selectedConnectionId = selectedConnection?.id;
        }
      }

      const qsConnectionId = qs.connectionId;
      if (qsConnectionId) {
        const selectedConnection = connections.find(
          (c) => c.id === qsConnectionId
        );
        if (Boolean(selectedConnection)) {
          update.selectedConnectionId = selectedConnection?.id;
        }
      }
    }

    useEditorStore.setState(update);
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

function setFocusedSession(update: Partial<EditorSession>) {
  const { focusedSessionId, editorSessions } = useEditorStore.getState();
  const focusedSession = useEditorStore.getState().getFocusedSession();
  useEditorStore.setState({
    editorSessions: {
      ...editorSessions,
      [focusedSessionId]: { ...focusedSession, ...update },
    },
  });
}

/**
 * Open a connection client for the currently selected connection if supported
 */
export async function connectConnectionClient() {
  const {
    connectionClient,
    connectionId,
  } = useEditorStore.getState().getFocusedSession();

  // If a connectionClient is already open or selected connection id doesn't exist, do nothing
  if (connectionClient || !connectionId) {
    return;
  }

  // Regular users are not allowed to get connections by id, but they can get list of connections
  // May want to store selected connection instead of just id
  const { data: connections } = await api.getConnections();
  const connection = (connections || []).find(
    (connection) => connection.id === connectionId
  );

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return;
  }

  const json = await api.post('/api/connection-clients', {
    connectionId,
  });
  if (json.error) {
    return message.error('Problem connecting to database');
  }

  // Poll connection-clients api to keep it alive
  const connectionClientInterval = setInterval(async () => {
    const updateJson = await api.put(
      `/api/connection-clients/${json.data.id}`,
      {}
    );

    // Not sure if this should message user here
    // In the event of an error this could get really noisy
    if (updateJson.error) {
      message.error(updateJson.error);
    }

    // If the PUT didn't return a connectionClient object,
    // the connectionClient has been disconnected
    if (!updateJson.data && connectionClientInterval) {
      clearInterval(connectionClientInterval);
      setFocusedSession({
        connectionClientInterval: undefined,
        connectionClient: undefined,
      });
    } else {
      setFocusedSession({
        connectionClient: updateJson.data,
      });
    }
  }, 10000);

  setFocusedSession({
    connectionClient: json.data,
    connectionClientInterval,
  });
}

/**
 * Disconnect the current connection client if one exists
 */
export async function disconnectConnectionClient() {
  const {
    connectionClient,
    connectionClientInterval,
  } = useEditorStore.getState().getFocusedSession();

  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  setFocusedSession({
    connectionClient: undefined,
    connectionClientInterval: undefined,
  });
}

/**
 * Select connection and disconnect connectionClient if it exists
 * @param connectionId
 */
export function selectConnectionId(connectionId: string) {
  const {
    connectionClient,
    connectionClientInterval,
  } = useEditorStore.getState().getFocusedSession();

  localforage
    .setItem('selectedConnectionId', connectionId)
    .catch((error) => message.error(error));

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  if (connectionClientInterval) {
    clearInterval(connectionClientInterval);
  }

  setFocusedSession({
    connectionId,
    connectionClient: undefined,
    connectionClientInterval: undefined,
  });
}

export const formatQuery = async () => {
  const { queryText, queryId } = useEditorStore.getState().getFocusedSession();

  const json = await api.post('/api/format-sql', {
    query: queryText,
  });

  if (json.error) {
    message.error(json.error);
    return;
  }

  if (!json.data || !json.data.query) {
    console.warn('unexpected API result');
    return;
  }

  setLocalQueryText(queryId, json.data.query);
  // TODO - once there more than 1 session user could toggle tabs before response comes back
  // setFocusedSession shortcut should go away for explicit session updates
  setFocusedSession({ queryText: json.data.query, unsavedChanges: true });
};

export const loadQuery = async (queryId: string) => {
  const { error, data } = await api.getQuery(queryId);
  if (error || !data) {
    return message.error('Query not found');
  }

  setFocusedSession({
    // Map query object to flattened editor session data
    queryId,
    connectionId: data.connectionId,
    queryText: data.queryText,
    queryName: data.name,
    tags: data.tags,
    acl: data.acl,
    chartType: data?.chart?.chartType,
    chartFields: data?.chart?.fields,
    canDelete: data.canDelete,
    canRead: data.canRead,
    canWrite: data.canWrite,
    // Reset result/error/unsaved/running states
    runQueryInstanceId: undefined,
    isRunning: false,
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false,
  });
};

export const runQuery = async () => {
  const {
    queryId,
    queryName,
    queryText,
    chartType,
    chartFields,
    connectionId,
    connectionClient,
    selectedText,
  } = useEditorStore.getState().getFocusedSession();

  // multiple queries could be running and we only want to keep the "current" or latest query run
  const runQueryInstanceId = uuidv4();

  setFocusedSession({
    runQueryInstanceId,
    isRunning: true,
    runQueryStartTime: new Date(),
  });

  const postData = {
    connectionId,
    connectionClientId: connectionClient && connectionClient.id,
    queryId,
    name: queryName,
    batchText: queryText,
    selectedText,
    chart: {
      chartType,
      fields: chartFields,
    },
  };

  const { data, error } = await runQueryViaBatch(postData);

  // Get latest state and check runQueryInstanceId to ensure it matches
  // If it matches another query has not been run and we can keep the result.
  // Not matching implies another query has been executed and we can ignore this result.
  if (
    useEditorStore.getState().getFocusedSession().runQueryInstanceId ===
    runQueryInstanceId
  ) {
    setFocusedSession({
      isRunning: false,
      queryError: error,
      queryResult: data,
    });
  }
};

export const saveQuery = async () => {
  const {
    queryId,
    connectionId,
    queryName,
    queryText,
    chartFields,
    chartType,
    tags,
    acl,
  } = useEditorStore.getState().getFocusedSession();

  if (!queryName) {
    message.error('Query name required');
    setFocusedSession({ showValidation: true });
    return;
  }

  setFocusedSession({ isSaving: true });
  const queryData = {
    connectionId,
    name: queryName,
    queryText,
    acl,
    chart: {
      chartType,
      fields: chartFields,
    },
    tags,
  };

  if (queryId) {
    api.put(`/api/queries/${queryId}`, queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        message.error(error);
        setFocusedSession({ isSaving: false });
        return;
      }
      api.reloadQueries();
      removeLocalQueryText(data.id);
      setFocusedSession({
        isSaving: false,
        unsavedChanges: false,
        connectionId: data.connectionId,
        queryText: data.queryText,
        queryName: data.name,
        tags: data.tags,
        acl: data.acl,
        chartType: data?.chart?.chartType,
        chartFields: data?.chart?.fields,
        canDelete: data.canDelete,
        canRead: data.canRead,
        canWrite: data.canWrite,
      });
    });
  } else {
    api.post(`/api/queries`, queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        message.error(error);
        setFocusedSession({ isSaving: false });
        return;
      }
      api.reloadQueries();
      window.history.replaceState(
        {},
        data.name,
        `${baseUrl()}/queries/${data.id}`
      );
      message.success('Query Saved');
      removeLocalQueryText(data.id);
      setFocusedSession({
        isSaving: false,
        unsavedChanges: false,
        connectionId: data.connectionId,
        queryText: data.queryText,
        queryName: data.name,
        tags: data.tags,
        acl: data.acl,
        chartType: data?.chart?.chartType,
        chartFields: data?.chart?.fields,
        canDelete: data.canDelete,
        canRead: data.canRead,
        canWrite: data.canWrite,
      });
    });
  }
};

export const handleCloneClick = () => {
  const { queryName } = useEditorStore.getState().getFocusedSession();
  const newName = `Copy of ${queryName}`;
  window.history.replaceState({}, newName, `${baseUrl()}/queries/new`);
  setFocusedSession({ queryId: '', queryName: newName, unsavedChanges: true });
};

export const resetNewQuery = () => {
  setFocusedSession({
    runQueryInstanceId: undefined,
    isRunning: false,
    queryId: '',
    queryName: '',
    tags: [],
    acl: [],
    connectionId: '',
    queryText: '',
    chartType: '',
    chartFields: {},
    canRead: true,
    canWrite: true,
    canDelete: true,
    queryError: undefined,
    queryResult: undefined,
    unsavedChanges: false,
  });
};

export const setQueryText = (queryText: string) => {
  const { queryId } = useEditorStore.getState().getFocusedSession();
  setLocalQueryText(queryId, queryText);
  setFocusedSession({ queryText, unsavedChanges: true });
};

export const setQueryName = (queryName: string) => {
  setFocusedSession({ queryName, unsavedChanges: true });
};

export const setTags = (tags: string[]) => {
  setFocusedSession({ tags, unsavedChanges: true });
};

export const setAcl = (acl: Partial<ACLRecord>[]) => {
  setFocusedSession({ acl, unsavedChanges: true });
};

export const setChartType = (chartType: string) => {
  setFocusedSession({ chartType, unsavedChanges: true });
};

export const setChartFields = (chartFields: ChartFields) => {
  setFocusedSession({ chartFields, unsavedChanges: true });
};

export const handleChartConfigurationFieldsChange = (
  chartFieldId: string,
  queryResultField: any
) => {
  const { chartFields } = useEditorStore.getState().getFocusedSession();

  setFocusedSession({
    chartFields: { ...chartFields, [chartFieldId]: queryResultField },
    unsavedChanges: true,
  });
};

export const handleChartTypeChange = (chartType: string) => {
  setFocusedSession({ chartType, unsavedChanges: true });
};

export const handleQuerySelectionChange = (selectedText: string) => {
  setFocusedSession({ selectedText });
};

export function toggleSchema() {
  const { showSchema } = useEditorStore.getState().getFocusedSession();
  setFocusedSession({ showSchema: !showSchema });
}

export function setSchemaState(connectionId: string, schemaState: SchemaState) {
  const { schemaStates } = useEditorStore.getState();
  const update = {
    ...schemaStates,
    [connectionId]: schemaState,
  };
  useEditorStore.setState({ schemaStates: update });
}

/**
 * Get schema via API and store into editor store
 * @param connectionId - connection id to get schema for
 * @param reload - force cache refresh for schema
 */
export async function loadSchema(connectionId: string, reload?: boolean) {
  const { schemaStates } = useEditorStore.getState();
  const { showSchema } = useEditorStore.getState().getFocusedSession();

  if (!schemaStates[connectionId] || reload) {
    setSchemaState(connectionId, {
      loading: true,
    });

    const json = await api.getConnectionSchema(connectionId, reload);
    const { error, data } = json;

    if (error) {
      setSchemaState(connectionId, {
        loading: false,
        error,
      });
      // If sidebar is not shown, send error notification
      // It is otherwise shown in sidebar where schema would be
      if (!showSchema) {
        message.error(error);
      }
      return;
    }

    if (data?.schemas || data?.tables) {
      updateCompletions(data);
    } else {
      updateCompletions({ schemas: [] });
    }

    // Pre-expand schemas
    const expanded: { [key: string]: boolean } = {};
    if (data?.schemas) {
      data.schemas.forEach((schema) => {
        expanded[schema.name] = true;
      });
    }

    setSchemaState(connectionId, {
      loading: false,
      connectionSchema: data,
      error: undefined,
    });

    setFocusedSession({ schemaExpansions: { [connectionId]: expanded } });
  }
}

export function toggleSchemaItem(connectionId: string, item: { id: string }) {
  const { schemaExpansions } = useEditorStore.getState().getFocusedSession();

  const expanded = { ...schemaExpansions[connectionId] };
  expanded[item.id] = !expanded[item.id];

  setFocusedSession({ schemaExpansions: { [connectionId]: expanded } });
}
