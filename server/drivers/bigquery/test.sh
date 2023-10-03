#!/bin/bash

if [ -z "${BIGQUERY_TEST_CREDENTIALS_FILE}" ]; then
  echo "Must set BIGQUERY_TEST_CREDENTIALS_FILE with service account json file for testing"
  exit 1
fi

if [ -z "${BIGQUERY_TEST_GCP_PROJECT_ID}" ]; then
  echo "Must set BIGQUERY_TEST_GCP_PROJECT_ID with Google Cloud Project Name for testing"
  exit 1
fi

if [ -z "${BIGQUERY_TEST_DATASET_NAME}" ]; then
  echo "Must set BIGQUERY_TEST_DATASET_NAME with BigQuery Dataset Name"
  exit 1
fi

if [ -z "${BIGQUERY_TEST_DATASET_LOCATION}" ]; then
  echo "Must set BIGQUERY_TEST_DATASET_LOCATION with Google Cloud Project Region e.g. US"
  exit 1
fi

npx mocha ./test.js
