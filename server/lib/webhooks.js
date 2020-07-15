const fetch = require('node-fetch');

function userSummary(user) {
  if (!user) {
    return;
  }
  const { id, name, email, role } = user;
  return { id, name, email, role };
}

function connectionSummary(connection) {
  if (!connection) {
    return;
  }
  return {
    id: connection.id,
    name: connection.name,
    driver: connection.driver,
  };
}

class Webhooks {
  constructor(config, appLog) {
    this.config = config;
    this.appLog = appLog;
  }

  sqlpadUrl() {
    const { config } = this;
    const port = parseInt(config.get('port'), 10);
    const publicUrl = config.get('publicUrl') || '';
    const baseUrl = config.get('baseUrl');

    if (!publicUrl) {
      return '';
    }

    const usingDefaultPort =
      (publicUrl.startsWith('https:') && port === 443) ||
      (publicUrl.startsWith('http:') && port === 80);

    const urlPort = !usingDefaultPort ? `:${port}` : '';

    return `${publicUrl}${urlPort}${baseUrl}`;
  }

  async send(hookName, url, body) {
    const { config, appLog } = this;
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'SQLPad-Secret': config.get('webhookSecret'),
          'SQLPad-URL': this.sqlpadUrl(),
          'SQLPad-Hook-Name': hookName,
        },
      });

      if (!res.ok) {
        appLog.error(
          {
            url,
            body,
            status: res.status,
            statusText: res.statusText,
          },
          `Error sending webhook`
        );
      }
    } catch (error) {
      appLog.error({ url, body, error }, `Error sending webhook`);
    }
  }

  userCreated(user) {
    const url = this.config.get('webhookUserCreatedUrl');
    if (url) {
      const body = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };
      return this.send('user_created', url, body);
    }
  }

  queryCreated(query, connection) {
    const url = this.config.get('webhookQueryCreatedUrl');
    if (url) {
      const {
        id,
        name,
        queryText,
        tags,
        chart,
        createdByUser,
        createdAt,
      } = query;

      const body = {
        id,
        name,
        queryText,
        tags,
        chart,
        createdByUser,
        createdAt,
        connection: connectionSummary(connection),
      };
      return this.send('query_created', url, body);
    }
  }

  batchCreated(user, connection, batch) {
    const url = this.config.get('webhookBatchCreatedUrl');
    if (!url) {
      return;
    }
    const { ...body } = batch;
    body.user = userSummary(user);
    body.connection = connectionSummary(connection);

    return this.send('batch_created', url, body);
  }

  batchFinished(user, connection, batch) {
    const url = this.config.get('webhookBatchFinishedUrl');
    if (!url) {
      return;
    }
    const { ...body } = batch;
    body.user = userSummary(user);
    body.connection = connectionSummary(connection);

    return this.send('batch_finished', url, body);
  }
}

module.exports = Webhooks;
