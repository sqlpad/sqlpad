import { MenuItem, MenuLink } from '@reach/menu-button';
import DownloadIcon from 'mdi-react/DownloadIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import useAppContext from '../utilities/use-app-context';
import IconMenu from './IconMenu';

type Ref = HTMLAnchorElement;

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

const NavigationLink = React.forwardRef<Ref, Props>((props, ref) => {
  return <Link {...props} innerRef={ref} />;
});

interface Links {
  json: string;
  csv: string;
  xlsx: string;
}

function ExportButton({
  links,
  onSaveImageClick,
}: {
  links: Links;
  onSaveImageClick?: () => void;
}) {
  const { config } = useAppContext();

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

export default ExportButton;
