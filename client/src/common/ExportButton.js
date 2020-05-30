import { MenuItem, MenuLink } from '@reach/menu-button';
import DownloadIcon from 'mdi-react/DownloadIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'unistore/react';
import IconMenu from './IconMenu';

const NavigationLink = React.forwardRef((props, ref) => {
  return <Link {...props} innerRef={ref} />;
});

function ExportButton({ config, links, onSaveImageClick }) {
  if (!config || !links) {
    return null;
  }

  const { allowCsvDownload } = config;

  const items = [];
  if (onSaveImageClick) {
    items.push(
      <MenuItem key="png" onSelect={onSaveImageClick}>
        png
      </MenuItem>
    );
  }
  if (allowCsvDownload) {
    items.push(
      <MenuLink
        key="csv"
        as={NavigationLink}
        to={links.csv}
        target="_blank"
        rel="noopener noreferrer"
      >
        csv
      </MenuLink>
    );
    items.push(
      <MenuLink
        key="xlsx"
        as={NavigationLink}
        to={links.xlsx}
        target="_blank"
        rel="noopener noreferrer"
      >
        xlsx
      </MenuLink>
    );
    items.push(
      <MenuLink
        key="json"
        as={NavigationLink}
        to={links.json}
        target="_blank"
        rel="noopener noreferrer"
      >
        json
      </MenuLink>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <IconMenu icon={<DownloadIcon aria-label="Download" />}>{items}</IconMenu>
  );
}

ExportButton.propTypes = {
  links: PropTypes.object,
  onSaveImageClick: PropTypes.func,
};

export default connect(['config'])(ExportButton);
