import { History } from 'history';
import { useHistory } from 'react-router-dom';

let _history: History | undefined = undefined;

export function getHistory() {
  return _history;
}

/**
 * Component to capture history from a hook and store in variable.
 */
export function RegisterHistory() {
  const history = useHistory();
  _history = history;
  return null;
}
