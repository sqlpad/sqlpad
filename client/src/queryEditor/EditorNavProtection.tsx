import React from 'react';
import { Prompt } from 'react-router-dom';
import { useMouseOverResultPane } from '../stores/editor-store';

// Guard against accidental navigation away from query results
//
// At this time the only scenario protected against is when the user is scrolling back over query results
// Scrolling too far can trigger the back navigation, which is often undesired
// To protect against this, we track when the mouse is over query results.
// If nav occurs we assume its probably from side scroll
function EditorNavProtection() {
  const mouseOverResultPane = useMouseOverResultPane();

  return (
    <Prompt
      when={mouseOverResultPane}
      message="Are you sure you want to leave?"
    />
  );
}

export default EditorNavProtection;
