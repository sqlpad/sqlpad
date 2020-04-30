import createStore from 'unistore';
import connections from './connections';
import queries from './queries';
import schema from './schema';

const unistoreStore = createStore({
  ...queries.initialState,
  ...schema.initialState,
  ...connections.initialState,
});

export default unistoreStore;
