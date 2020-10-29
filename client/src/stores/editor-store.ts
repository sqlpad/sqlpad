import create from 'zustand';
import {
  ConnectionSchema,
  ConnectionClient,
  ChartFields,
  ACLRecord,
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
  schemaExpansions: { [conectionId: string]: ExpandedMap };
  connectionId: string;
  connectionClient?: ConnectionClient;
  runQueryInstanceId?: string;
  isRunning: boolean;
  isSaving: boolean;
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
  queryError?: any;
  queryResult?: any;
  runQueryStartTime?: any;
  showValidation: boolean;
  unsavedChanges: boolean;
}

export type EditorStoreState = {
  initialized: boolean;
  focusedSessionId: string;
  editorSessions: Record<string, EditorSession>;
  schemaStates: { [conectionId: string]: SchemaState };
  getSession: () => EditorSession;
};

const INITIAL_SESSION_ID = 'initial';

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  initialized: false,
  focusedSessionId: INITIAL_SESSION_ID,
  editorSessions: {
    [INITIAL_SESSION_ID]: {
      id: INITIAL_SESSION_ID,
      showSchema: true,
      schemaExpansions: {},
      connectionId: '',
      connectionClient: undefined,
      runQueryInstanceId: undefined,
      isRunning: false,
      isSaving: false,
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
      showValidation: false,
      unsavedChanges: false,
    },
  },
  schemaStates: {},
  getSession: () => {
    const { focusedSessionId, editorSessions } = get();
    if (!editorSessions[focusedSessionId]) {
      throw new Error('Editor session not found');
    }
    return editorSessions[focusedSessionId];
  },
}));

export function useInitialized() {
  return useEditorStore((s) => s.initialized);
}

export function useSessionQueryShared() {
  return useEditorStore((s) => {
    const { acl } = s.getSession();
    return (acl || []).length > 0;
  });
}

export function useSessionTags() {
  return useEditorStore((s) => s.getSession().tags);
}

export function useSessionQueryId() {
  return useEditorStore((s) => s.getSession().queryId);
}

export function useSessionQueryName() {
  return useEditorStore((s) => s.getSession().queryName);
}

export function useSessionQueryText() {
  return useEditorStore((s) => s.getSession().queryText);
}

export function useSessionShowValidation() {
  return useEditorStore((s) => s.getSession().showValidation);
}

export function useSessionIsRunning() {
  return useEditorStore((s) => s.getSession().isRunning);
}

export function useSessionIsSaving() {
  return useEditorStore((s) => s.getSession().isSaving);
}

export function useSessionUnsavedChanges() {
  return useEditorStore((s) => s.getSession().unsavedChanges);
}

export function useSessionConnectionId(): string {
  return useEditorStore((s) => s.getSession().connectionId);
}

export function useSessionConnectionClient() {
  return useEditorStore((s) => s.getSession().connectionClient);
}

export function useSessionShowSchema(): boolean {
  return useEditorStore((s) => s.getSession().showSchema);
}

export function useSessionChartType() {
  return useEditorStore((s) => s.getSession().chartType);
}

export function useSessionChartFields() {
  return useEditorStore((s) => s.getSession().chartFields);
}

export function useSessionQueryResult() {
  return useEditorStore((s) => s.getSession().queryResult);
}

export function useSessionQueryError() {
  return useEditorStore((s) => s.getSession().queryError);
}

export function useSessionRunQueryStartTime() {
  return useEditorStore((s) => s.getSession().runQueryStartTime);
}

export function useSessionSchemaExpanded(connectionId?: string) {
  return useEditorStore((s) => {
    const { schemaExpansions } = s.getSession();
    if (!connectionId || !schemaExpansions[connectionId]) {
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
