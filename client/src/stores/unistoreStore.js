import createStore from 'unistore';
import appNav from './appNav';
import config from './config';
import connections from './connections';
import queries from './queries';
import schema from './schema';
import tags from './tags';

export const unistoreStore = createStore({
  ...queries.initialState,
  ...appNav.initialState,
  ...schema.initialState,
  ...connections.initialState,
  ...tags.initialState
});

export const actions = store => {
  return {
    toggleSchema: appNav.toggleSchema,
    toggleVisSidebar: appNav.toggleVisSidebar,

    refreshAppContext: config.refreshAppContext,

    loadSchemaInfo: schema.loadSchemaInfo(store),
    toggleSchemaItem: schema.toggleSchemaItem(store),

    selectConnectionId: connections.selectConnectionId,
    deleteConnection: connections.deleteConnection,
    addUpdateConnection: connections.addUpdateConnection,
    loadConnections: connections.loadConnections(store),

    loadTags: tags.loadTags,

    formatQuery: queries.formatQuery,
    loadQueries: queries.loadQueries(store),
    deleteQuery: queries.deleteQuery,
    loadQuery: queries.loadQuery,
    runQuery: queries.runQuery(store),
    saveQuery: queries.saveQuery(store),
    handleCloneClick: queries.handleCloneClick,
    resetNewQuery: queries.resetNewQuery,
    setQueryState: queries.setQueryState,
    handleChartConfigurationFieldsChange:
      queries.handleChartConfigurationFieldsChange,
    handleChartTypeChange: queries.handleChartTypeChange,
    handleQuerySelectionChange: queries.handleQuerySelectionChange
  };
};
