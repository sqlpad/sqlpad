import create from 'zustand';
import {
  ACLRecord,
  Batch,
  ChartFields,
  ConnectionClient,
  ConnectionSchema,
  Statement,
  StatementColumn,
} from '../types';

export type ExpandedMap = { [itemPath: string]: boolean };

export interface SchemaState {
  loading: boolean;
  connectionSchema?: ConnectionSchema;
  error?: string;
}

export interface EditorSession {
  id: string;
  showSchema: boolean;
  showVisProperties: boolean;
  schemaExpansions: { [conectionId: string]: ExpandedMap };
  connectionId: string;
  connectionClient?: ConnectionClient;
  batchId?: string;
  isRunning: boolean;
  isSaving: boolean;
  saveError?: string;
  // Editor session takes Query model fields and flattens
  queryId?: string;
  queryName: string;
  queryText: string;
  tags: string[];
  acl: Partial<ACLRecord>[];
  chartType: string;
  chartFields: ChartFields;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  // Additional data for editor states
  selectedText: string;
  selectedStatementId: string;
  queryError?: any;
  queryResult?: any;
  runQueryStartTime?: any;
  showValidation: boolean;
  unsavedChanges: boolean;
}

export type EditorStoreState = {
  initialized: boolean;
  showQueryModal: boolean;
  mouseOverResultPane: boolean;
  focusedSessionId: string;
  editorSessions: Record<string, EditorSession>;
  batches: Record<string, Batch>;
  statements: Record<string, Statement>;
  schemaStates: { [conectionId: string]: SchemaState };
  getFocusedSession: () => EditorSession;
  getSession: (sessionId: string) => EditorSession | undefined;
};

export const INITIAL_SESSION_ID = 'initial';

export const INITIAL_SESSION: EditorSession = {
  id: INITIAL_SESSION_ID,
  showSchema: true,
  showVisProperties: false,
  schemaExpansions: {},
  connectionId: '',
  connectionClient: undefined,
  batchId: undefined,
  isRunning: false,
  isSaving: false,
  saveError: undefined,
  queryId: undefined,
  queryName: '',
  queryText: '',
  tags: [],
  acl: [],
  chartType: '',
  chartFields: {},
  canRead: true,
  canWrite: true,
  canDelete: true,
  queryError: undefined,
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  selectedStatementId: '',
  showValidation: false,
  unsavedChanges: false,
};

export const INITIAL_STATE = {
  initialized: false,
  showQueryModal: false,
  mouseOverResultPane: false,
  focusedSessionId: INITIAL_SESSION_ID,
  editorSessions: {
    [INITIAL_SESSION_ID]: INITIAL_SESSION,
  },
  batches: {},
  statements: {},
  schemaStates: {},
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  ...INITIAL_STATE,
  getFocusedSession: () => {
    const { focusedSessionId, editorSessions } = get();
    return editorSessions[focusedSessionId];
  },
  getSession: (sessionId) => {
    const { editorSessions } = get();
    const session = editorSessions[sessionId];
    if (!session) {
      return;
    }
    return session;
  },
}));

export function useInitialized() {
  return useEditorStore((s) => s.initialized);
}

export function useShowQueryModal() {
  return useEditorStore((s) => s.showQueryModal);
}

export function useMouseOverResultPane() {
  return useEditorStore((s) => s.mouseOverResultPane);
}

export function useSessionQueryShared() {
  return useEditorStore((s) => {
    const { acl } = s.getFocusedSession();
    return (acl || []).length > 0;
  });
}

export function useSessionSaveError() {
  return useEditorStore((s) => s.getFocusedSession().saveError);
}

export function useSessionTags() {
  return useEditorStore((s) => s.getFocusedSession().tags);
}

export function useSessionQueryId() {
  return useEditorStore((s) => s.getFocusedSession().queryId);
}

export function useSessionQueryName() {
  return useEditorStore((s) => s.getFocusedSession().queryName);
}

export function useSessionQueryText() {
  return useEditorStore((s) => s.getFocusedSession().queryText);
}

export function useSessionACL() {
  return useEditorStore((s) => s.getFocusedSession().acl);
}

export function useSessionShowValidation() {
  return useEditorStore((s) => s.getFocusedSession().showValidation);
}

export function useSessionIsRunning() {
  return useEditorStore((s) => s.getFocusedSession().isRunning);
}

export function useSessionIsSaving() {
  return useEditorStore((s) => s.getFocusedSession().isSaving);
}

export function useSessionUnsavedChanges() {
  return useEditorStore((s) => s.getFocusedSession().unsavedChanges);
}

export function useSessionCanWrite() {
  return useEditorStore((s) => s.getFocusedSession().canWrite);
}

export function useSessionConnectionId(): string {
  return useEditorStore((s) => s.getFocusedSession().connectionId);
}

export function useSessionConnectionClient() {
  return useEditorStore((s) => s.getFocusedSession().connectionClient);
}

export function useSessionConnectionClientId() {
  return useEditorStore((s) => s.getFocusedSession().connectionClient?.id);
}

export function useSessionShowSchema() {
  return useEditorStore((s) => s.getFocusedSession().showSchema);
}

export function useSessionShowVisProperties() {
  return useEditorStore((s) => s.getFocusedSession().showVisProperties);
}

export function useSessionChartType() {
  return useEditorStore((s) => s.getFocusedSession().chartType);
}

export function useSessionChartFields() {
  return useEditorStore((s) => s.getFocusedSession().chartFields);
}

export function useSessionQueryResult() {
  return useEditorStore((s) => s.getFocusedSession().queryResult);
}

export function useSessionQueryError() {
  return useEditorStore((s) => {
    const { queryError, selectedStatementId } = s.getFocusedSession();
    if (queryError) {
      return queryError;
    }
    if (selectedStatementId) {
      const statementError = s.statements[selectedStatementId]?.error?.title;
      if (statementError) {
        return statementError;
      }
    }
    return;
  });
}

export function useBatchError() {
  return useEditorStore((s) => {
    const { queryError, batchId } = s.getFocusedSession();
    if (queryError) {
      return queryError;
    }
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch?.statements) {
        const errored = batch.statements.find(
          (statement) => statement.status === 'error'
        );
        if (errored) {
          return errored.error?.title;
        }
      }
    }
    return;
  });
}

export function useSessionRunQueryStartTime() {
  return useEditorStore((s) => s.getFocusedSession().runQueryStartTime);
}

export function useSessionSelectedStatementId() {
  return useEditorStore((s) => s.getFocusedSession().selectedStatementId);
}

export function useSessionSchemaExpanded(connectionId?: string) {
  return useEditorStore((s) => {
    const { schemaExpansions } = s.getFocusedSession();
    if (!connectionId || !schemaExpansions || !schemaExpansions[connectionId]) {
      return {};
    }
    return schemaExpansions[connectionId];
  });
}

export function useSchemaState(connectionId?: string) {
  return useEditorStore((s) => {
    if (!connectionId || !s.schemaStates[connectionId]) {
      const emptySchemaState: SchemaState = { loading: false };
      return emptySchemaState;
    }
    return s.schemaStates[connectionId];
  });
}

/**
 * Get current batch for the session
 */
export function useSessionBatch() {
  return useEditorStore((s) => {
    const { batchId } = s.getFocusedSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch) {
        return batch;
      }
    }
  });
}

export function useLastStatementId() {
  return useEditorStore((s) => {
    const { batchId } = s.getFocusedSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch && batch.statements) {
        const lastStatement = batch.statements[batch.statements.length - 1];
        if (lastStatement) {
          return lastStatement.id;
        }
      }
    }
    return '';
  });
}

export function useSessionTableLink(sequence?: number) {
  return useEditorStore((s) => {
    const { queryId, connectionClient } = s.getFocusedSession();
    const connectionClientId = connectionClient?.id;

    let tableLink = '';

    if (queryId && queryId !== 'new') {
      tableLink = `/query-table/${queryId}`;

      const searchParams = new URLSearchParams();

      if (connectionClientId) {
        searchParams.append('connectionClientId', connectionClientId);
      }
      if (sequence) {
        searchParams.append('sequence', sequence.toString());
      }

      tableLink += `?${searchParams.toString()}`;
    }

    return tableLink;
  });
}

/**
 * Get statement by sequence number for current session
 * If sequence is not provided, the last statement will be returned
 * @param sequence
 */
export function useSessionStatementIdBySequence(sequence?: number) {
  return useEditorStore((s) => {
    const { batchId } = s.getFocusedSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch && batch.statements) {
        const statementBySequence = batch.statements.find(
          (s) => s.sequence === sequence
        );
        if (statementBySequence) {
          return statementBySequence.id;
        }

        const lastStatement = batch.statements[batch.statements.length - 1];
        if (lastStatement) {
          return lastStatement.id;
        }
      }
    }
    return '';
  });
}

export function useStatementRowCount(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return undefined;
    }
    return s.statements[statementId]?.rowCount;
  });
}

export function useStatementIncomplete(statementId: string) {
  return useEditorStore((s) => Boolean(s.statements[statementId]?.incomplete));
}

export function useStatementDurationMs(statementId: string) {
  return useEditorStore((s) => s.statements[statementId]?.durationMs);
}

const NO_COLUMNS: StatementColumn[] = [];

export function useStatementColumns(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return NO_COLUMNS;
    }
    return s.statements[statementId]?.columns;
  });
}

export function useStatementStatus(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return '';
    }
    return s.statements[statementId]?.status;
  });
}

export function useStatementSequence(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return undefined;
    }
    return s.statements[statementId]?.sequence;
  });
}

export function useStatementText(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return '';
    }
    return s.statements[statementId]?.statementText;
  });
}
