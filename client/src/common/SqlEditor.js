// NOTE this import 'brace' must occur before the importing of brace extensions
import 'brace'
import 'brace/ext/searchbox'
import 'brace/mode/sql'
import 'brace/theme/sqlserver'
import PropTypes from 'prop-types'
import React from 'react'
import Measure from 'react-measure'
import AceEditor from 'react-ace'
import AppContext from '../containers/AppContext'

const noop = () => {}

class SqlEditor extends React.Component {
  state = {
    dimensions: {
      width: -1,
      height: -1
    }
  }

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

  handleSelection = selection => {
    const { onSelectionChange } = this.props
    const { editor } = this
    if (editor && editor.session) {
      const selectedText = editor.session.getTextRange(selection.getRange())
      onSelectionChange(selectedText)
    }
  }

  handleRef = ref => {
    this.editor = ref ? ref.editor : null
  }

  render() {
    const { config, onChange, readOnly, value } = this.props
    const { width, height } = this.state.dimensions

    if (this.editor && config.editorWordWrap) {
      this.editor.session.setUseWrapMode(true)
    }

    return (
      <Measure
        bounds
        onResize={contentRect => {
          this.setState({ dimensions: contentRect.bounds })
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="h-100 w-100">
            <AceEditor
              editorProps={{ $blockScrolling: Infinity }}
              enableBasicAutocompletion
              enableLiveAutocompletion
              height={height + 'px'}
              highlightActiveLine={false}
              mode="sql"
              name="query-ace-editor"
              onChange={onChange || noop}
              onSelectionChange={this.handleSelection}
              showGutter={false}
              showPrintMargin={false}
              theme="sqlserver"
              readOnly={readOnly}
              value={value}
              width={width + 'px'}
              ref={this.handleRef}
            />
          </div>
        )}
      </Measure>
    )
  }
}

SqlEditor.propTypes = {
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string
}

SqlEditor.defaultProps = {
  onSelectionChange: () => {},
  readOnly: false,
  value: ''
}

class SqlEditorContainer extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {appContext => {
          return <SqlEditor {...this.props} config={appContext.config} />
        }}
      </AppContext.Consumer>
    )
  }
}

export default SqlEditorContainer
