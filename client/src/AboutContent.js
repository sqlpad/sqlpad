import PropTypes from 'prop-types';
import React from 'react';

class AboutContent extends React.Component {
  render() {
    const { version } = this.props;
    return (
      <div>
        <p>
          <strong>Version</strong>: {version}
        </p>
        <p>
          <strong>Project Page</strong>:{' '}
          <a
            href="http://rickbergfalk.github.io/sqlpad/"
            target="_blank"
            rel="noopener noreferrer"
          >
            http://rickbergfalk.github.io/sqlpad{' '}
            <span
              style={{ marginLeft: 4 }}
              className="glyphicon glyphicon-new-window"
              aria-hidden="true"
            />
          </a>
        </p>
        <hr />
        <ul className="nav nav-pills nav-justified">
          <li role="presentation">
            <a
              href="https://github.com/rickbergfalk/sqlpad/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit an Issue{' '}
              <span
                className="glyphicon glyphicon-new-window"
                aria-hidden="true"
              />
            </a>
          </li>
          <li role="presentation">
            <a
              href="https://github.com/rickbergfalk/sqlpad/blob/master/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Changelog{' '}
              <span
                className="glyphicon glyphicon-new-window"
                aria-hidden="true"
              />
            </a>
          </li>
          <li role="presentation">
            <a
              href="https://github.com/rickbergfalk/sqlpad"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repository{' '}
              <span
                className="glyphicon glyphicon-new-window"
                aria-hidden="true"
              />
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

AboutContent.propTypes = {
  version: PropTypes.string
};

AboutContent.defaultProps = {
  version: ''
};

export default AboutContent;
