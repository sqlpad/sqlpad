import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import updateCompletions from '../utilities/updateCompletions.js';

export const initialState = {
  schema: {} // schema.<connectionId>.loading / schemaInfo / lastUpdated
};

export const loadSchemaInfo = store => async (state, connectionId, reload) => {
  const { schema } = state;
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
    const { error, schemaInfo } = json;
    if (error) {
      return message.error(error);
    }
    updateCompletions(schemaInfo);

    // Pre-expand schemas
    const expanded = {};
    if (schemaInfo) {
      Object.keys(schemaInfo).forEach(schemaName => {
        expanded[schemaName] = true;
      });
    }

    return {
      schema: {
        ...schema,
        [connectionId]: {
          loading: false,
          schemaInfo,
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
  toggleSchemaItem
};
