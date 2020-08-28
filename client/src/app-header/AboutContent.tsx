import React from 'react';
import OpenInNewIcon from 'mdi-react/OpenInNewIcon';

const LINK_STYLE = { display: 'inline-flex', alignItems: 'center' };

type OwnProps = {
  version?: string;
};

type Props = OwnProps & typeof AboutContent.defaultProps;

function AboutContent({ version }: Props) {
  return (
    <div>
      <p>
        <strong>Version</strong>: {version}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginBottom: 16,
        }}
      >
        <a
          href="http://rickbergfalk.github.io/sqlpad/"
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          Project page <OpenInNewIcon size={18} />
        </a>
        <a
          href="https://github.com/rickbergfalk/sqlpad/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          Submit an Issue <OpenInNewIcon size={18} />
        </a>
        <a
          href="https://github.com/rickbergfalk/sqlpad/blob/master/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          Changelog <OpenInNewIcon size={18} />
        </a>
        <a
          href="https://github.com/rickbergfalk/sqlpad"
          target="_blank"
          rel="noopener noreferrer"
          style={LINK_STYLE}
        >
          GitHub <OpenInNewIcon size={18} />
        </a>
      </div>

      <p>
        <strong>Shortcuts</strong>
      </p>
      <ul style={{ paddingLeft: 0 }}>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>ctrl+s</code> / <code>command+s</code> : Save
        </li>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>ctrl+return</code> / <code>command+return</code> : Run
        </li>
        <li style={{ listStyleType: 'none', marginBottom: 8 }}>
          <code>shift+return</code> : Format
        </li>
      </ul>

      <p>
        <strong>Tip</strong>
      </p>
      <p>Run only a portion of a query by highlighting it first.</p>
    </div>
  );
}

AboutContent.defaultProps = {
  version: '',
};

export default AboutContent;
