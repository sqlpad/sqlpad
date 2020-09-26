import create from 'zustand';
import message from '../common/message';
import { api } from '../utilities/fetch-json';
import updateCompletions from '../utilities/updateCompletions';

type State = {
  showSchema: boolean;
  schema: any;
};

const useSchemaStore = create<State>((set, get) => ({
  showSchema: true,
  schema: {},
}));

export function useShowSchema(): boolean {
  return useSchemaStore((s) => s.showSchema);
}

export function toggleSchema() {
  const { showSchema } = useSchemaStore.getState();
  useSchemaStore.setState({ showSchema: !showSchema });
}

export function useSchema() {
  return useSchemaStore((s) => s.schema);
}

export function setSchema(schema: any) {
  useSchemaStore.setState({ schema });
}

export async function loadSchemaInfo(connectionId: string, reload?: boolean) {
  const { showSchema, schema } = useSchemaStore.getState();

  if (!schema[connectionId] || reload) {
    setSchema({
      ...schema,
      [connectionId]: {
        loading: true,
        expanded: {},
      },
    });

    const qs = reload ? '?reload=true' : '';
    const json = await api.get(`/api/schema-info/${connectionId}${qs}`);
    const { error, data } = json;
    if (error) {
      setSchema({
        ...schema,
        [connectionId]: {
          loading: false,
          error,
        },
      });
      // If sidebar is not shown, send error notification
      // It is otherwise shown in sidebar where schema would be
      if (!showSchema) {
        message.error(error);
      }
      return;
    }
    updateCompletions(data);

    // Pre-expand schemas
    const expanded: { [key: string]: boolean } = {};
    if (data) {
      Object.keys(data).forEach((schemaName) => {
        expanded[schemaName] = true;
      });
    }

    setSchema({
      ...schema,
      [connectionId]: {
        loading: false,
        schemaInfo: data,
        error: null,
        expanded,
      },
    });
  }
}

export function toggleSchemaItem(connectionId: string, item: { id: string }) {
  const { schema } = useSchemaStore.getState();
  const connectionSchema = schema[connectionId];
  const open = !connectionSchema.expanded[item.id];
  setSchema({
    ...schema,
    [connectionId]: {
      ...connectionSchema,
      expanded: { ...connectionSchema.expanded, [item.id]: open },
    },
  });
}
