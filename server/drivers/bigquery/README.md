# BigQuery Driver

## Notes

- This incorporates [prior incomplete work by `hongkongkiwi` on GitHub](https://github.com/hongkongkiwi/sqlpad/commit/d731b24b6c1e7a2ccc18e8528263e830bca17660) (last commit on Dec 7, 2018.
- Queries time out after 5 minutes. When a query times out, an error is thrown, and the error message is displayed in the results area of SQLPad.
- The driver uses the [Standard SQL dialect](https://cloud.google.com/bigquery/docs/reference/standard-sql/enabling-standard-sql), which is more powerful and standards-compliant than the older BigQuery Legacy SQL dialect. (The latter is still the default dialect of the `bq` CLI tool).

## Testing

### Running unit tests with mocha.js

Tests are automatically skipped if the required environment variables haven't been defined.

The BigQuery driver cannot be tested without creating a project in Google Cloud. Luckily, that's not hard. Here are the steps required to test the driver:

- Create a project in Google Cloud.
- Enable the BigQuery API for your project, create a service account, and download the service account key [per this BigQuery Getting Started doc](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries).
- Create a new BigQuery dataset using the web console or the command line:
    - Web: go into BigQuery (under Big Data in the list of services on the left) and create a new dataset (e.g. `my_new_dataset`).
    - CLI: after [installing and initializing the Cloud SDK](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-command-line), run `bq mk my_new_dataset`.
- From the root directory of the `SQLPad` repo, run `scripts/build.sh` to install dependencies.
- Define and export the following environment variables:
    - BIGQUERY_TEST_CREDENTIALS_FILE - service account JSON file pathname
    - BIGQUERY_TEST_GCP_PROJECT_ID - Google Cloud project name
    - BIGQUERY_TEST_DATASET_NAME - BigQuery dataset name (unqualified tables will default to this)
    - BIGQUERY_TEST_DATASET_LOCATION - Google Cloud project region e.g. "US"
- Run `sh test.sh`.

### Manually testing the BigQuery driver _in situ_ within `SQLPad`:

- Make sure that `scripts/build.sh` has been run to install dependencies.
- `export SQLPAD_ADMIN=admin`
- `export SQLPAD_ADMIN_PASSWORD=something`
- From the top level of the repo: `cd server && node server.js --dbPath ../db --port 3010`
- Point your browser at http://localhost:3010 and log in using the credentials you just defined.
- Create a new Connection, choosing the BigQuery driver, adding your GCP project ID, the path to the service account keyfile, the dataset you created, and the location (`US`).
- Select the new connection and execute some statements, e.g.:
    ```
    create table my_new_dataset.junk(foo string);
    insert into my_new_dataset.junk values ('bar');
    select * from my_new_dataset.junk;
    ```

    Note that if the connection's dataset is `my_new_dataset`, you can omit the `my_new_dataset.` prefixes in these statements.
