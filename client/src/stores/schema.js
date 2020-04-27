import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import updateCompletions from '../utilities/updateCompletions.js';

export const initialState = {
  showSchema: true,
  schema: {} // schema.<connectionId>.loading / schemaInfo / lastUpdated
};

export function toggleSchema(state) {
  const showSchema = !state.showSchema;
  return {
    showSchema
  };
}

export const loadSchemaInfo = store => async (state, connectionId, reload) => {
  const { schema, showSchema } = state;
  if (!schema[connectionId] || reload) {
    store.setState({
      schema: {
        ...schema,
        [connectionId]: {
          loading: true,
          expanded: {}
        }
      }
    });

    const qs = reload ? '?reload=true' : '';
    const json = await fetchJson(
      'GET',
      `/api/schema-info/${connectionId}${qs}`
    );
    const { error, data } = json;
    if (error) {
      store.setState({
        schema: {
          ...schema,
          [connectionId]: {
            loading: false,
            error
          }
        }
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
    const expanded = {};
    if (data) {
      Object.keys(data).forEach(schemaName => {
        expanded[schemaName] = true;
      });
    }

    return {
      schema: {
        ...schema,
        [connectionId]: {
          loading: false,
          schemaInfo: data,
          error: null,
          expanded
        }
      }
    };
  }
};

export const toggleSchemaItem = (state, connectionId, item) => {
  const { schema } = state;
  const connectionSchema = schema[connectionId];
  const open = !connectionSchema.expanded[item.id];
  return {
    schema: {
      ...schema,
      [connectionId]: {
        ...connectionSchema,
        expanded: { ...connectionSchema.expanded, [item.id]: open }
      }
    }
  };
};

export default {
  initialState,
  loadSchemaInfo,
  toggleSchema,
  toggleSchemaItem
};
