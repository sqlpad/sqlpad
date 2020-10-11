import create from 'zustand';
import { ConnectionSchema } from '../types';

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

interface SchemaState {
  loading: boolean;
  schemaInfo?: ConnectionSchema;
  error?: string;
  expanded: { [key: string]: boolean };
}

type State = {
  showSchema: boolean;
  schema: { [conectionId: string]: SchemaState };
  initialized: boolean;
  selectedConnectionId: string;
  connectionClient: any;
  connectionClientInterval: any;
  runQueryInstanceId: any;
  isRunning: boolean;
  isSaving: boolean;
  query: any;
  queryError: any;
  queryResult: any;
  runQueryStartTime: any;
  selectedText: string;
  showValidation: boolean;
  unsavedChanges: boolean;
};

export const useEditorStore = create<State>((set, get) => ({
  showSchema: true,
  schema: {},
  initialized: false,
  selectedConnectionId: '',
  connectionClient: null,
  connectionClientInterval: null,
  runQueryInstanceId: null,
  isRunning: false,
  isSaving: false,
  query: Object.assign({}, NEW_QUERY),
  queryError: undefined,
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  showValidation: false,
  unsavedChanges: false,
}));

export function useSelectedConnectionId(): string {
  return useEditorStore((s) => s.selectedConnectionId);
}

export function useConnectionClient(): any {
  return useEditorStore((s) => s.connectionClient);
}

export function useShowSchema(): boolean {
  return useEditorStore((s) => s.showSchema);
}

export function useSchema() {
  return useEditorStore((s) => s.schema);
}
