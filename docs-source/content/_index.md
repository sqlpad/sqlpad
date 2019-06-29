---
title: "SQLPad"
date: 2018-01-27T10:36:46-05:00
draft: false
---

     
<section class="header">
  <div class="row">
    <h1>SQLPad</h1>
  </div>
  <div class="row">
    <h3>Run SQL in your browser and chart the results</h3>
    <p><img class="u-max-full-width" src="images/screenshots/v3-beta.png" alt="SQLPad Query Editor" /></p>
  </div>
  <h3>
      Supports <br /> Postgres, MySQL, SQL Server, <br /> Vertica, Crate, Presto, SAP Hana, <br /> Apache Drill, and Cassandra (kinda).
  </h3>
  <div class="value-props row">
    <div class="three columns value-prop">
      <img style="width: 70%;" src="images/logo-postgresql.png" />
    </div>
    <div class="three columns value-prop">
      <img class="u-max-full-width" src="images/logo-mysql.png" />
    </div>
    <div class="three columns value-prop">
      <img class="u-max-full-width" src="images/logo-sql-server.png" />
    </div>
    <div class="three columns value-prop">
      <img class="u-max-full-width" src="images/logo-vertica.jpg" />
    </div>
  </div>
</section>
    
    
<div class="docs-section" id="about">
  <div class="row">
    <div class="two columns">
      <p> </p>
    </div>
    <div class="eight columns">
      <h6 class="docs-header">About</h6>
      <p>
        SQLPad is a self-hosted web app for writing and running SQL queries 
        and visualizing the results. Its goal is to be a simple tool for
        exploratory data work and visualizations, ideal for
        data analysts who would prefer to work in SQL.
      </p>
      <p>
        SQLPad is meant to be run on an internal network for a single team. 
        All connections added to the app can be used by all individuals with access 
        to the SQLPad server. All queries written can be run and edited by everyone on 
        the server.
      </p>
      <p>
        If you want to be bold and daring, you can expose your SQLPad instance 
        to the outside world. Please make sure you fully understand the risks 
        associated with doing this and use HTTPS.
      </p>
    </div>
  </div>
</div>
      
<div class="docs-section" id="installation">
    <div class="row">
        <div class="two columns">
            <p> </p>
        </div>
        <div class="columns eight">
            <h6 class="docs-header">Installation</h6>
            <p>
              Installing SQLPad is as simple as installing <a href="https://nodejs.org/">Node.js</a> 
              and running <code>npm install sqlpad -g</code> at a command prompt.
            </p>
            <p>
              For more details on installing and running a SQLPad instance, 
              see <a href="posts/installation-and-administration">Installation and Administration page</a>.
            </p>
        </div>
    </div>
</div>

<div class="docs-section" id="limitations">
    <div class="row">
        <div class="two columns">
            <p> </p>
        </div>
        <div class="eight columns">
            <h6 class="docs-header">Limitations</h6>
            <p>
                Be sure not to query with 2 columns returned of the same name. 
                Some SQL reporting systems can handle this. SQLPad can't.
            </p>
            <p>
                Every query is run with a new session/connection, so keep 
                that in mind if you use variables and temp tables and 
                split up your SQL executions. If this doesn't make any sense 
                to you just forget you read this you probably won't be impacted by it.
            </p>
        </div>
        <div class="four columns"></div>
    </div>
</div>

<div class="docs-section" id="alternatives">
    <div class="row">
        <div class="two columns">
            <p> </p>
        </div>
        <div class="eight columns">
            <h6 class="docs-header">Is SQLPad For Me?</h6>
            <p>
                SQLPad aims to be a SQL query environment with a focus on exploring and analyzing data via SQL,
                and it will not adopt a dashboard use case. 
                If you're looking for open-source dashboard software or something more advanced, 
                check out <a href="https://redash.io/">Redash</a>, 
                <a href="https://www.metabase.com/">Metabase</a>, 
                or <a href="https://github.com/apache/incubator-superset">Superset</a>.
            </p>
            <p>
              SQLPad likely does as much as it'll ever do and could even be considered finished. Development these days is mostly maintenance and cleanup.
            </p>
        </div>
        <div class="four columns"></div>
    </div>
</div>
