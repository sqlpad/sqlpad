import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import Measure from 'react-measure';
import useAppContext from '../utilities/use-app-context';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-sqlserver';

const noop = () => {};

export interface Props {
  autoHeight: boolean;
  onChange?: (value: string) => void;
  readOnly: boolean;
  value: string;
  onSelectionChange: (value: string) => void;
}

function SqlEditor({
  autoHeight,
  onChange,
  readOnly,
  value,
  onSelectionChange,
}: Props) {
  const { config } = useAppContext();
  const [dimensions, setDimensions] = useState({ width: -1, height: -1 });
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    if (editor && onChange) {
      // augment the built-in behavior of liveAutocomplete
      // built-in behavior only starts autocomplete when at least 1 character has been typed
      // In ace the . resets the prefix token and clears the completer
      // In order to get completions for 'sometable.' we need to fire the completer manually
      editor.commands.on('afterExec', (e: any) => {
        if (e.command.name === 'insertstring' && /^[\w.]$/.test(e.args)) {
          if (e.args === '.') {
            editor.execCommand('startAutocomplete');
          }
        }
      });

      editor.session.setUseWrapMode(Boolean(config?.editorWordWrap));
    }
  }, [editor, onChange, config]);

  const handleSelection = (selection: any) => {
    if (editor && editor.session) {
      const selectedText = editor.session.getTextRange(selection.getRange());
      onSelectionChange(selectedText);
    }
  };

  const { width, height } = dimensions;

  const setOptions = {
    useWorker: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: false,
    showLineNumbers: true,
    tabSize: 2,
  };

  if (autoHeight) {
    return (
      <Measure
        bounds
        onResize={(contentRect: any) => setDimensions(contentRect.bounds)}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="h-100 w-100">
            <AceEditor
              editorProps={{ $blockScrolling: Infinity }}
              focus={!readOnly}
              height={height + 'px'}
              fontSize={14}
              highlightActiveLine={false}
              mode="sql"
              name="query-ace-editor"
              onChange={onChange || noop}
              onLoad={(editor) => setEditor(editor)}
              onSelectionChange={handleSelection}
              readOnly={readOnly}
              setOptions={setOptions}
              showGutter={true}
              showPrintMargin={false}
              theme="sqlserver"
              value={value}
              width={width + 'px'}
            />
          </div>
        )}
      </Measure>
    );
  }

  return (
    <AceEditor
      editorProps={{ $blockScrolling: Infinity }}
      focus={!readOnly}
      fontSize={14}
      highlightActiveLine={false}
      mode="sql"
      name="query-ace-editor"
      onChange={onChange || noop}
      onLoad={(editor) => setEditor(editor)}
      onSelectionChange={handleSelection}
      readOnly={readOnly}
      setOptions={setOptions}
      showGutter={true}
      showPrintMargin={false}
      theme="sqlserver"
      value={value}
      maxLines={12}
      width={'100%'}
    />
  );
}

SqlEditor.propTypes = {
  autoHeight: PropTypes.bool,
  onChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string,
};

SqlEditor.defaultProps = {
  autoHeight: true,
  onSelectionChange: () => {},
  readOnly: false,
  value: '',
};

export default React.memo(SqlEditor);
