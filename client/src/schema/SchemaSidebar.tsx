import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
} from '@reach/menu-button';
import OpenIcon from 'mdi-react/MenuDownIcon';
import ClosedIcon from 'mdi-react/MenuRightIcon';
import RefreshIcon from 'mdi-react/RefreshIcon';
import React, { ChangeEvent, ReactNode, useState } from 'react';
import Measure from 'react-measure';
import { FixedSizeList as List } from 'react-window';
import Divider from '../common/Divider';
import ErrorBlock from '../common/ErrorBlock';
import IconButton from '../common/IconButton';
import Input from '../common/Input';
import Sidebar from '../common/Sidebar';
import SpinKitCube from '../common/SpinKitCube';
import Text from '../common/Text';
import Tooltip from '../common/Tooltip';
import { loadSchema, toggleSchemaItem } from '../stores/editor-actions';
import {
  useSchemaState,
  useSessionConnectionId,
  useSessionSchemaExpanded,
} from '../stores/editor-store';
import getSchemaList from './getSchemaList';
import styles from './SchemaSidebar.module.css';
import searchSchemaInfo from './searchSchemaInfo';

const ICON_SIZE = 22;
const ICON_STYLE = { marginBottom: -6, marginRight: 0, marginLeft: -6 };

function formatIdentifiers(s: string, quoteChars: string = '') {
  const leftQuote = quoteChars[0] || '';
  const rightQuote = quoteChars[1] || quoteChars[0] || '';

  return s
    .split('.')
    .map((s) => `${leftQuote}${s}${rightQuote}`)
    .join('.');
}

function SchemaSidebar() {
  const connectionId = useSessionConnectionId();
  const [search, setSearch] = useState('');
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1,
  });

  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [id, setId] = useState('');

  const expanded = useSessionSchemaExpanded(connectionId);
  const { loading, connectionSchema, error } = useSchemaState(connectionId);

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (connectionId) {
      loadSchema(connectionId, true);
    }
  };

  const filteredSchemaInfo = searchSchemaInfo(connectionSchema || {}, search);
  const visibleItems = getSchemaList(filteredSchemaInfo, expanded);

  const Row: React.FunctionComponent<{
    index: number;
    style: React.CSSProperties;
  }> = ({ index, style }) => {
    const row = visibleItems[index];

    if (!row) {
      return null;
    }

    const classNames = [styles.schemaItem];

    let icon = null;

    const expandable = row.type === 'schema' || row.type === 'table';
    if (expandable) {
      classNames.push(styles.expandable);
      icon = expanded[row.id] ? (
        <OpenIcon size={ICON_SIZE} style={ICON_STYLE} />
      ) : (
        <ClosedIcon size={ICON_SIZE} style={ICON_STYLE} />
      );
    }

    const indentationPadding = row.level * 20 + (!expandable ? 10 : 0);

    const description = row.description ? (
      <Tooltip
        key="colDesc"
        label={row.description}
        style={{
          maxWidth: '300px',
          whiteSpace: 'normal',
        }}
      >
        <span>{row.description}</span>
      </Tooltip>
    ) : null;

    const dataType = row.dataType ? <span>{row.dataType}</span> : null;

    let secondary = null;
    if (dataType && description) {
      secondary = (
        <Text type="secondary" style={{ paddingLeft: 8 }}>
          {dataType} - {description}
        </Text>
      );
    } else if (dataType) {
      secondary = (
        <Text type="secondary" style={{ paddingLeft: 8 }}>
          {dataType}
        </Text>
      );
    } else if (description) {
      secondary = (
        <Text type="secondary" style={{ paddingLeft: 8 }}>
          {description}
        </Text>
      );
    }

    function handleClick() {
      if (expandable) {
        toggleSchemaItem(connectionId, row);
      }
    }

    // TODO either switch to button or improve aria for clicking on li
    return (
      <li
        id={row.id}
        key={row.id}
        className={classNames.join(' ')}
        style={{ ...style, paddingLeft: indentationPadding }}
        onClick={handleClick}
      >
        {icon}
        {row.name}
        {secondary}
      </li>
    );
  };

  let content: ReactNode = null;
  if (error) {
    content = <ErrorBlock>{error}</ErrorBlock>;
  } else if (loading) {
    content = (
      <div className={styles.schemaSpinner}>
        <SpinKitCube />
      </div>
    );
  } else if (true) {
    content = (
      <ul style={{ paddingLeft: 0 }}>
        <List
          // position absolute takes list out of flow,
          // preventing some weird react-measure behavior in Firefox
          style={{ position: 'absolute' }}
          height={dimensions.height}
          itemCount={visibleItems.length}
          itemSize={22}
          width={dimensions.width}
          overscanCount={10}
        >
          {Row}
        </List>
      </ul>
    );
  }

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    console.log(event.clientX, event.clientY);

    const target = event.target as HTMLDivElement;
    const id = target.id;

    setId(id);
    setTop(event.clientY);
    setLeft(event.clientX);

    if (id) {
      const el = document.getElementById('context-menu');
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent('mousedown', true, true);
      el?.dispatchEvent(clickEvent);
    }
  }

  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        if (contentRect.bounds) {
          setDimensions(contentRect.bounds);
        }
      }}
    >
      {({ measureRef }) => (
        <Sidebar>
          <div style={{ display: 'flex' }}>
            <Input
              value={search}
              placeholder="Search schema"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
            />
            <IconButton
              tooltip="Refresh schema"
              style={{ marginLeft: 8 }}
              disabled={loading}
              onClick={handleRefreshClick}
            >
              <RefreshIcon />
            </IconButton>
          </div>

          <Divider style={{ margin: '4px 0' }} />

          {/* 
            This menu is hidden and moves around based on where context-menu click happens 
            This is hacky but works! reach-ui does not expose the menu components 
            in a way that allows them to be used for context menu
          */}
          <Menu>
            <MenuButton
              id="context-menu"
              style={{
                visibility: 'hidden',
                position: 'absolute',
                height: 1,
                left,
                top: top - 90,
              }}
            >
              Hidden context menu
            </MenuButton>
            <MenuPopover style={{ zIndex: 999999 }}>
              <MenuItems>
                <MenuItem
                  onSelect={() =>
                    navigator.clipboard.writeText(formatIdentifiers(id))
                  }
                >
                  Copy{' '}
                  <span className="monospace-font">
                    {formatIdentifiers(id)}
                  </span>
                </MenuItem>
                <MenuItem
                  onSelect={() =>
                    navigator.clipboard.writeText(formatIdentifiers(id, '"'))
                  }
                >
                  Copy{' '}
                  <span className="monospace-font">
                    {formatIdentifiers(id, '"')}
                  </span>
                </MenuItem>
                <MenuItem
                  onSelect={() =>
                    navigator.clipboard.writeText(formatIdentifiers(id, '[]'))
                  }
                >
                  Copy{' '}
                  <span className="monospace-font">
                    {formatIdentifiers(id, '[]')}
                  </span>
                </MenuItem>
              </MenuItems>
            </MenuPopover>
          </Menu>

          <div
            style={{
              display: 'flex',
              flexGrow: 1,
            }}
          >
            <div
              ref={measureRef}
              onContextMenu={handleContextMenu}
              style={{
                display: 'flex',
                width: '100%',
              }}
            >
              {content}
            </div>
          </div>
        </Sidebar>
      )}
    </Measure>
  );
}

export default React.memo(SchemaSidebar);
