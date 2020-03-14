# SQLPad

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, SAP HANA, Snowflake, BigQuery, SQLite, and many others via ODBC.

![SQLPad](images/screenshots/v3-beta.png)

## Database Support

<style>
  .db-images {
    display: flex;
    flex-wrap: wrap;
  }
  .db-container {
    margin: 8px;
    width: 160px;
    font-size: 18pt;
    color: #23a2c9;
    height: 160px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    text-shadow: 1px 1px #00000030;
    padding: 8px;
  }
  .db-container-text {
    background-color:  #23a2c9;
    color: white;
  }
</style>
<div class="db-images">
  <div class="db-container">
    <img src="images/logo-postgresql.png" data-origin="images/logo-postgresql.png" alt="Postgres" >
  </div>
  <div class="db-container">
    <img src="images/logo-mysql.png" data-origin="images/logo-mysql.png" alt="MySQL">
  </div>
  <div class="db-container">
    <img src="images/logo-sql-server.png" data-origin="images/logo-sql-server.png" alt="SQL Server">
  </div>
  <div class="db-container">
    <img src="images/logo-vertica.jpg" data-origin="images/logo-vertica.png" alt="Vertica" >
  </div>
  <div class="db-container db-container-text">Crate</div>
  <div class="db-container db-container-text">Presto</div>
  <div class="db-container db-container-text">SAP Hana</div>
  <div class="db-container db-container-text">Apache Drill</div>
  <div class="db-container db-container-text">Cassandra</div>
  <div class="db-container db-container-text">Snowflake</div>
  <div class="db-container db-container-text">BigQuery</div>
  <div class="db-container db-container-text">SQLite</div>
  <div class="db-container db-container-text">Many others via ODBC</div>
</div>

## Is SQLPad for me?

SQLPad is a self-hosted web app for writing and running SQL queries
and optionally visualizing the results. It's a simple tool for
exploratory data work and visualizations, or quick convenient access to run a SQL query here and there.

It's hackable and basic.

## Why not SQLPad?

It's not a dashboarding tool, and likely will never become one. If you're looking for open-source dashboarding check out [redash](https://redash.io/), [Metabase](https://www.metabase.com/) or [Superset](https://github.com/apache/incubator-superset).

It can't handle a query with 2 columns returned of the same name.

It uses an in-memory database and is intended to be run as a single instance. Running multiple instances with loadbalancing in front will yield unpredictable results.

It's written in Node.js, which was exciting in 2014 but in hindsight Python or Java would have been a better choice.

It's hackable and basic.
