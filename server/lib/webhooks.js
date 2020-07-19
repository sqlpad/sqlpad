const fetch = require('node-fetch');
const appLog = require('./app-log');

function userSummary(user) {
  if (!user) {
    return;
  }
  const { id, name, email, role, createdAt } = user;
  return { id, name, email, role, createdAt };
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
  /**
   *
   * @param {import('./config')} config
   * @param {import('../models')} models
   * @param {import('./app-log')} appLog
   */
  constructor(config, models, appLog) {
    this.config = config;
    this.models = models;
    this.appLog = appLog;
  }

  hookEnabledUrl(hookConfigKeyName) {
    return (
      this.config.get('webhookEnabled') && this.config.get(hookConfigKeyName)
    );
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
        body: JSON.stringify({
          action: hookName,
          sqlpadUrl: this.sqlpadUrl(),
          ...body,
        }),
        headers: {
          'Content-Type': 'application/json',
          'SQLPad-Secret': config.get('webhookSecret'),
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
    const url = this.hookEnabledUrl('webhookUserCreatedUrl');
    if (!url) {
      return;
    }

    const body = {
      user: userSummary(user),
    };

    return this.send('user_created', url, body);
  }

  queryCreated(query, connection) {
    const url = this.hookEnabledUrl('webhookQueryCreatedUrl');
    if (!url) {
      return;
    }

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
      query: {
        id,
        name,
        queryText,
        tags,
        chart,
        createdByUser,
        createdAt,
      },
      connection: connectionSummary(connection),
    };

    return this.send('query_created', url, body);
  }

  batchCreated(user, connection, batch) {
    const url = this.hookEnabledUrl('webhookBatchCreatedUrl');
    if (!url) {
      return;
    }

    const body = {
      batch,
      user: userSummary(user),
      connection: connectionSummary(connection),
    };

    return this.send('batch_created', url, body);
  }

  batchFinished(user, connection, batch) {
    const url = this.hookEnabledUrl('webhookBatchFinishedUrl');
    if (!url) {
      return;
    }

    const body = {
      batch,
      user: userSummary(user),
      connection: connectionSummary(connection),
    };

    return this.send('batch_finished', url, body);
  }

  async statementCreated(user, connection, batch, statement) {
    const url = this.hookEnabledUrl('webhookStatementCreatedUrl');
    if (!url) {
      return;
    }

    const { statements, ...batchWithoutStatements } = batch;

    const body = {
      statement,
      batch: batchWithoutStatements,
      user: userSummary(user),
      connection: connectionSummary(connection),
    };

    return this.send('statement_created', url, body);
  }

  async statementFinished(user, connection, batch, statementId) {
    const url = this.hookEnabledUrl('webhookStatementFinishedUrl');
    if (!url) {
      return;
    }

    try {
      const { statements, ...batchWithoutStatements } = batch;

      const statement = await this.models.statements.findOneById(statementId);
      const results = await this.models.statements.getStatementResults(
        statementId
      );

      const body = {
        statement,
        batch: batchWithoutStatements,
        user: userSummary(user),
        connection: connectionSummary(connection),
        results,
      };

      return this.send('statement_finished', url, body);
    } catch (error) {
      appLog.error(error, 'error sending statement created webhook');
    }
  }
}

module.exports = Webhooks;
