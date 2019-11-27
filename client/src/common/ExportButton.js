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

function ExportButton({ config, cacheKey, onSaveImageClick }) {
  if (!config || !cacheKey) {
    return null;
  }

  const { baseUrl, allowCsvDownload } = config;

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
        to={`${baseUrl}/download-results/${cacheKey}.csv`}
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
        to={`${baseUrl}/download-results/${cacheKey}.xlsx`}
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
        to={`${baseUrl}/download-results/${cacheKey}.json`}
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
  cacheKey: PropTypes.string,
  onSaveImageClick: PropTypes.func
};

export default connect(['config'])(ExportButton);
