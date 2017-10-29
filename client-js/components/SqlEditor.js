import React from 'react'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import 'brace/ext/searchbox'

const noop = () => {}

class SqlEditor extends React.Component {
  componentDidMount() {
    const { config, onChange } = this.props
    const editor = this.editor

    if (editor && onChange) {
      editor.focus()

      // augment the built-in behavior of liveAutocomplete
      // built-in behavior only starts autocomplete when at least 1 character has been typed
      // In ace the . resets the prefix token and clears the completer
      // In order to get completions for 'sometable.' we need to fire the completer manually
      editor.commands.on('afterExec', e => {
        if (e.command.name === 'insertstring' && /^[\w.]$/.test(e.args)) {
          if (e.args === '.') {
            editor.execCommand('startAutocomplete')
          }
        }
      })
      if (config.editorWordWrap) {
        editor.session.setUseWrapMode(true)
      }
    }
  }

  render() {
    const { config, onChange, readOnly, value } = this.props

    if (this.editor && config.editorWordWrap) {
      this.editor.session.setUseWrapMode(true)
    }

    return (
      <AceEditor
        editorProps={{ $blockScrolling: Infinity }}
        enableBasicAutocompletion
        enableLiveAutocompletion
        height="50%"
        highlightActiveLine={false}
        mode="sql"
        name="query-ace-editor"
        onChange={onChange || noop}
        showGutter={false}
        showPrintMargin={false}
        theme="sqlserver"
        readOnly={readOnly}
        value={value}
        width="100%"
        ref={ref => {
          this.editor = ref ? ref.editor : null
        }}
      />
    )
  }
}

SqlEditor.propTypes = {
  config: PropTypes.object.isRequired,
  height: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string
}

SqlEditor.defaultProps = {
  height: '50%',
  readOnly: false,
  value: ''
}

export default SqlEditor
