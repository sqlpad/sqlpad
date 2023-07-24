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

function formatIdentifiers(s: string, quoteChars = '') {
  const leftQuote = quoteChars[0] || '';
  const rightQuote = quoteChars[1] || quoteChars[0] || '';

  return s
    .split('.')
    .map((s) => `${leftQuote}${s}${rightQuote}`)
    .join('.');
}

/**
 * Input fields for clipboard copy value sourcing
 * The input must be visible/displayed somewhere, in our case offscreen
 * @param props
 */
function OffScreenInput({ id, value }: { id: string; value: string }) {
  return (
    <input
      id={id}
      type="text"
      readOnly
      style={{ position: 'absolute', left: -9999 }}
      value={value}
    />
  );
}

/**
 * MenuItem to query for related input rendered and select and copy its text
 * @param props
 */
function CopyMenuItem({ id, value }: { id: string; value: string }) {
  return (
    <MenuItem
      onSelect={() => {
        const copyText: HTMLInputElement | null = document.querySelector(id);
        if (copyText) {
          copyText.select();
          document.execCommand('copy');
        }
      }}
    >
      Copy <span className="monospace-font">{value}</span> to clipboard
    </MenuItem>
  );
}

function SchemaSidebar() {
  const connectionId = useSessionConnectionId();
  const [search, setSearch] = useState('');
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1,
  });

  const [contextTop, setContextTop] = useState(0);
  const [contextLeft, setContextLeft] = useState(0);
  const [schemaItemId, setSchemaItemId] = useState('');

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

    const expandable = row.type === 'catalog' || row.type === 'schema' || row.type === 'table';
    if (expandable) {
      classNames.push(styles.expandable);
      icon =
        expanded[row.id] === true ? (
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
  } else {
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

  // On right-click we'd like to show a context menu related to item clicked
  // For now this will be options to copy the full path of the item
  // The way this works is kind of hacky:
  // * We take note of location clicked
  // * Move hidden menu button to location
  // * Fire a click event on that hidden menu button
  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();

    // target needs casting as no way of knowing what it is
    const target = event.target as HTMLDivElement;
    const id = target?.id;

    setSchemaItemId(id);
    setContextTop(event.clientY);
    setContextLeft(event.clientX);

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

          {/* Input fields for copy-paste value sourcing */}
          <OffScreenInput
            id="schema-copy-value-no-quote"
            value={formatIdentifiers(schemaItemId)}
          />
          <OffScreenInput
            id="schema-copy-value-quote"
            value={formatIdentifiers(schemaItemId, '"')}
          />
          <OffScreenInput
            id="schema-copy-value-bracket"
            value={formatIdentifiers(schemaItemId, '[]')}
          />

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
                position: 'fixed',
                height: 1,
                left: contextLeft,
                top: contextTop,
              }}
            >
              Hidden context menu
            </MenuButton>
            <MenuPopover style={{ zIndex: 999999 }}>
              <MenuItems>
                <CopyMenuItem
                  id="#schema-copy-value-no-quote"
                  value={formatIdentifiers(schemaItemId)}
                />
                <CopyMenuItem
                  id="#schema-copy-value-quote"
                  value={formatIdentifiers(schemaItemId, '"')}
                />
                <CopyMenuItem
                  id="#schema-copy-value-bracket"
                  value={formatIdentifiers(schemaItemId, '[]')}
                />
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
