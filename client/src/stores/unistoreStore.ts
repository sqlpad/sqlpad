import createStore from 'unistore';
import queries from './queries';

const unistoreStore = createStore({
  ...queries.initialState,
});

export default unistoreStore;
