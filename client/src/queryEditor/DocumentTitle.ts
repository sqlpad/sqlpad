import { useSessionQueryName } from '../stores/editor-store';

/**
 * This component isolates the work of updating the document title on query name changes.
 * This is a component to prevent the main QueryEditor component from rendering on name change.
 * @param {object} props
 */
function DocumentTitle({ queryId }: { queryId: string }) {
  const queryName = useSessionQueryName();
  const title = queryId === '' ? 'New query' : queryName;

  if (document.title !== title) {
    document.title = title;
  }

  return null;
}

export default DocumentTitle;
