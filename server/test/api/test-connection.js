const TestUtils = require('../utils');
const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

describe('api/test-connection', function () {
  const utils = new TestUtils();

  before(function () {
    return utils.init(true);
  });

  after(function () {
    // Prevent unadvertent mocking
    AWSMock.restore();
  });

  it('tests connection success', async function () {
    await utils.post('admin', '/api/test-connection', {
      name: 'test connection',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite',
    });
  });

  it('tests connection failure for invalid driver', async function () {
    await utils.post(
      'admin',
      '/api/test-connection',
      {
        name: 'test connection',
        driver: 'not-real-driver',
        filename: './test/fixtures/not-real-db',
      },
      500
    );
  });

  it('tests connection success for async connections', async function () {
    AWSMock.setSDKInstance(AWS);

    AWSMock.mock('Athena', 'startQueryExecution', () => {
      return Promise.resolve({
        QueryExecutionId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });
    AWSMock.mock('Athena', 'getQueryResults', () => {
      return Promise.resolve({ results: [] });
    });
    AWSMock.mock('Athena', 'getQueryExecution', () => {
      return Promise.resolve({
        QueryExecution: {
          Status: { State: 'SUCCEEDED' },
          ResultConfiguration: {
            OutputLocation: 's3://test/location/data.csv',
          },
          StatementType: 'DML',
        },
      });
    });
    AWSMock.mock('S3', 'getObject', () => {
      return Promise.resolve({});
    });
    await utils.post(
      'admin',
      '/api/test-connection',
      {
        name: 'test async connection',
        driver: 'athena',
        awsRegion: 'us-east-1',
        awsAccessKeyId: 'access',
        awsSecretAccessKey: 'secret',
      },
      200
    );
  });
});
