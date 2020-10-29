import localforage from 'localforage';
import queryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import message from '../common/message';
import { ACLRecord, AppInfo, ChartFields, Connection } from '../types';
import { api } from '../utilities/api';
import baseUrl from '../utilities/baseUrl';
import {
  removeLocalQueryText,
  setLocalQueryText,
} from '../utilities/localQueryText';
import runQueryViaBatch from '../utilities/runQueryViaBatch';
import updateCompletions from '../utilities/updateCompletions';
import { EditorSession, SchemaState, useEditorStore } from './editor-store';

const { getState, setState } = useEditorStore;

function setSession(update: Partial<EditorSession>) {
  const { focusedSessionId, editorSessions } = getState();
  const focusedSession = getState().getSession();
  setState({
    editorSessions: {
      ...editorSessions,
      [focusedSessionId]: { ...focusedSession, ...update },
    },
  });
}

// Schedule connectionClient Heartbeat
// This only does work if data exists to do the work on
// Assumption here is that the API call will finish in the 10 seconds this is scheduled for
setInterval(async () => {
  const { connectionClient } = getState().getSession();

  if (connectionClient) {
    const updateJson = await api.put(
      `/api/connection-clients/${connectionClient.id}`,
      {}
    );

    const currentConnectionClient = getState().getSession().connectionClient;

    // If the connectionClient changed since hearbeat, do nothing
    if (currentConnectionClient?.id !== connectionClient?.id) {
      return;
    }

    // If the PUT didn't return a connectionClient object or has an error,
    // the connectionClient has been disconnected
    if (updateJson.error || !updateJson.data) {
      setSession({
        connectionClient: undefined,
      });
    } else {
      setSession({
        connectionClient: updateJson.data,
      });
    }
  }
}, 10000);

export const initApp = async (
  config: AppInfo['config'],
  connections: Connection[]
) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    let initialConnectionId = '';

    if (connections.length === 1) {
      selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c) => c.id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          initialConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c) => c.id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
          initialConnectionId = selectedConnectionId;
        }
      }

      const qs = queryString.parse(window.location.search);
      const qsConnectionName = qs.connectionName;
      if (qsConnectionName) {
        const selectedConnection = connections.find(
          (c) => c.name === qsConnectionName
        );
        if (selectedConnection?.id) {
          initialConnectionId = selectedConnection?.id;
        }
      }

      const qsConnectionId = qs.connectionId;
      if (qsConnectionId) {
        const selectedConnection = connections.find(
          (c) => c.id === qsConnectionId
        );
        if (selectedConnection?.id) {
          initialConnectionId = selectedConnection?.id;
        }
      }
    }

    setSession({ connectionId: initialConnectionId });
    setState({ initialized: true });
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

/**
 * Open a connection client for the currently selected connection if supported
 */
export async function connectConnectionClient() {
  const { connectionClient, connectionId } = getState().getSession();

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

  setSession({
    connectionClient: json.data,
  });
}

/**
 * Disconnect the current connection client if one exists
 */
export async function disconnectConnectionClient() {
  const { connectionClient } = getState().getSession();

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  setSession({
    connectionClient: undefined,
  });
}

/**
 * Select connection and disconnect connectionClient if it exists
 * @param connectionId
 */
export function selectConnectionId(connectionId: string) {
  const { connectionClient } = getState().getSession();

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

  setSession({
    connectionId,
    connectionClient: undefined,
  });
}

export const formatQuery = async () => {
  const { queryText, queryId } = getState().getSession();

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
  setSession({ queryText: json.data.query, unsavedChanges: true });
};

export const loadQuery = async (queryId: string) => {
  const { error, data } = await api.getQuery(queryId);
  if (error || !data) {
    return message.error('Query not found');
  }

  const { connectionClient } = getState().getSession();

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  setSession({
    // Map query object to flattened editor session data
    queryId,
    connectionId: data.connectionId,
    connectionClient: undefined,
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
  } = getState().getSession();

  // multiple queries could be running and we only want to keep the "current" or latest query run
  const runQueryInstanceId = uuidv4();

  setSession({
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
  if (getState().getSession().runQueryInstanceId === runQueryInstanceId) {
    setSession({
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
  } = getState().getSession();

  if (!queryName) {
    message.error('Query name required');
    setSession({ showValidation: true });
    return;
  }

  setSession({ isSaving: true });
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
        setSession({ isSaving: false });
        return;
      }
      api.reloadQueries();
      removeLocalQueryText(data.id);
      setSession({
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
        setSession({ isSaving: false });
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
      setSession({
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
  const { queryName } = getState().getSession();
  const newName = `Copy of ${queryName}`;
  window.history.replaceState({}, newName, `${baseUrl()}/queries/new`);
  setSession({ queryId: '', queryName: newName, unsavedChanges: true });
};

export const resetNewQuery = () => {
  // NOTE connectionId IS NOT set here on purpose
  // The new query should have the same connection as previously
  setSession({
    runQueryInstanceId: undefined,
    isRunning: false,
    queryId: '',
    queryName: '',
    tags: [],
    acl: [],
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
  const { queryId } = getState().getSession();
  setLocalQueryText(queryId, queryText);
  setSession({ queryText, unsavedChanges: true });
};

export const setQueryName = (queryName: string) => {
  setSession({ queryName, unsavedChanges: true });
};

export const setTags = (tags: string[]) => {
  setSession({ tags, unsavedChanges: true });
};

export const setAcl = (acl: Partial<ACLRecord>[]) => {
  setSession({ acl, unsavedChanges: true });
};

export const setChartType = (chartType: string) => {
  setSession({ chartType, unsavedChanges: true });
};

export const setChartFields = (chartFields: ChartFields) => {
  setSession({ chartFields, unsavedChanges: true });
};

export const handleChartConfigurationFieldsChange = (
  chartFieldId: string,
  queryResultField: any
) => {
  const { chartFields } = getState().getSession();

  setSession({
    chartFields: { ...chartFields, [chartFieldId]: queryResultField },
    unsavedChanges: true,
  });
};

export const handleChartTypeChange = (chartType: string) => {
  setSession({ chartType, unsavedChanges: true });
};

export const handleQuerySelectionChange = (selectedText: string) => {
  setSession({ selectedText });
};

export function toggleSchema() {
  const { showSchema } = getState().getSession();
  setSession({ showSchema: !showSchema });
}

export function setSchemaState(connectionId: string, schemaState: SchemaState) {
  const { schemaStates } = getState();
  const update = {
    ...schemaStates,
    [connectionId]: schemaState,
  };
  setState({ schemaStates: update });
}

/**
 * Get schema via API and store into editor store
 * @param connectionId - connection id to get schema for
 * @param reload - force cache refresh for schema
 */
export async function loadSchema(connectionId: string, reload?: boolean) {
  const { schemaStates } = getState();
  const { showSchema, schemaExpansions } = getState().getSession();

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

    setSession({
      schemaExpansions: { ...schemaExpansions, [connectionId]: expanded },
    });
  }

  // Refresh completions
  const connectionSchema = getState().schemaStates[connectionId]
    ?.connectionSchema;

  if (connectionSchema?.schemas || connectionSchema?.tables) {
    updateCompletions(connectionSchema);
  } else {
    updateCompletions({ schemas: [] });
  }
}

export function toggleSchemaItem(connectionId: string, item: { id: string }) {
  const { schemaExpansions } = getState().getSession();

  const expanded = { ...schemaExpansions[connectionId] };
  expanded[item.id] = !expanded[item.id];

  setSession({
    schemaExpansions: { ...schemaExpansions, [connectionId]: expanded },
  });
}
