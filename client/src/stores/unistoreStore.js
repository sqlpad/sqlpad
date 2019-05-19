import createStore from 'unistore';
import appNav from './appNav';
import connections from './connections';
import queries from './queries';
import schema from './schema';
import tags from './tags';

const unistoreStore = createStore({
  ...queries.initialState,
  ...appNav.initialState,
  ...schema.initialState,
  ...connections.initialState,
  ...tags.initialState
});

export default unistoreStore;
