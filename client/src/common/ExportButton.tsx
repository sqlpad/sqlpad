import { MenuItem, MenuLink } from '@reach/menu-button';
import DownloadIcon from 'mdi-react/DownloadIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import useAppContext from '../utilities/use-app-context';
import IconMenu from './IconMenu';

type Ref = HTMLAnchorElement;

interface NavigationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

const NavigationLink = React.forwardRef<Ref, NavigationLinkProps>(
  (props, ref) => {
    return <Link {...props} innerRef={ref} />;
  }
);

function ExportButton({
  statementId,
  onSaveImageClick,
}: {
  statementId?: string;
  onSaveImageClick?: () => void;
}) {
  const { config } = useAppContext();

  if (!config || !statementId) {
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
        to={`/statement-results/${statementId}.csv`}
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
        to={`/statement-results/${statementId}.xlsx`}
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
        to={`/statement-results/${statementId}.json`}
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
