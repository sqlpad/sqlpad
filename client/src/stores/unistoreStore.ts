import createStore from 'unistore';
import connections from './connections';
import queries from './queries';

const unistoreStore = createStore({
  ...queries.initialState,
  ...connections.initialState,
});

export default unistoreStore;
