/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sqliteDriver = require('./drivers/sqlite');

/**
 * This script generates server/test/fixtures/sales.sqlite file for testing and dev purposes
 *
 * The idea of this sqlite database file is to be used for development and testing,
 * to replace the `mock` driver that parses SQL comments and generates some output.
 *
 * This db can be extended to potentially have better views that simulate larger amounts of data.
 *
 * The generated file should try to remain a reasonable size (a few MBs).
 * If always distributed it can serve as a good debug tool for others.
 */

const filename = path.join(__dirname, 'test/fixtures/sales.sqlite');

const client = new sqliteDriver.Client({
  filename
});

const regions = [
  { region: 'Northeast', multiplier: 1.5 },
  { region: 'West', multiplier: 1.4 },
  { region: 'South', multiplier: 1.1 },
  { region: 'Midwest', multiplier: 1.2 },
  { region: 'East', multiplier: 1.2 }
];

// This is just another number to use as a metric for charts
const hypes = [1, 3, 3, 4, 4, 4, 4, 4, 4, 1, 1, 1, 3];

const products = [
  {
    name: 'Awesome Wooden Ball',
    category: 'toy',
    color: 'azure',
    price: 3.99
  },
  {
    name: 'Awesome Wooden Ball',
    category: 'toy',
    color: 'lime',
    price: 4.99
  },
  {
    name: 'Fantastic Rubber Tuna',
    category: 'toy',
    color: 'azure',
    price: 8.99
  },
  {
    name: 'Fantastic Rubber Tuna',
    category: 'toy',
    color: 'indigo',
    price: 7.99
  },
  {
    name: 'Fantastic Rubber Tuna',
    category: 'toy',
    color: 'cyan',
    price: 9.99
  },
  {
    name: 'Generic Wooden Keyboard',
    category: 'tech',
    color: 'azure',
    price: 29.99
  },
  {
    name: 'Generic Wooden Keyboard',
    category: 'tech',
    color: 'lime',
    price: 25.99
  },
  {
    name: 'Generic Wooden Keyboard',
    category: 'tech',
    color: 'red',
    price: 31.99
  },
  {
    name: 'Generic Wooden Keyboard',
    category: 'tech',
    color: 'azure',
    price: 31.99
  },
  {
    name: 'Handmade Granite Monitor',
    category: 'tech',
    color: 'cyan',
    price: 99.99
  },
  {
    name: 'Incredible Rubber ball',
    category: 'toy',
    color: 'lime',
    price: 12.99
  },
  {
    name: 'Refined Frozen Fish',
    category: 'food',
    color: 'cyan',
    price: 22.99
  },
  {
    name: 'Rustic Concrete Chips',
    category: 'food',
    color: 'azure',
    price: 2.99
  },
  {
    name: 'Rustic Metal Bacon',
    category: 'food',
    color: 'red',
    price: 7.99
  },
  {
    name: 'Rustic Metal Bacon',
    category: 'food',
    color: 'azure',
    price: 8.99
  },
  {
    name: 'Unbranded Granite laptop',
    category: 'tech',
    color: 'indigo',
    price: 149.99
  }
];

async function main() {
  if (fs.existsSync(filename)) {
    console.log('removing existing file %s', filename);
    fs.unlinkSync(filename);
  }

  await client.connect();

  console.log('creating regions');
  await client.runQuery(
    'CREATE TABLE regions (id INTEGER PRIMARY KEY, region TEXT)'
  );

  for (let i = 0; i < regions.length; i++) {
    await client.runQuery(
      `INSERT INTO regions 
        (id, region) 
        VALUES 
        (${i + 1}, '${regions[i].region}')`
    );
  }

  console.log('creating products');
  await client.runQuery(
    `CREATE TABLE products (
      id INTEGER PRIMARY KEY, 
      name TEXT, 
      category TEXT, 
      color TEXT,
      price REAL
    )`
  );
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    await client.runQuery(
      `INSERT INTO products (
          id, 
          name, 
          category, 
          color,
          price
        ) VALUES (
          ${i + 1}, 
          '${product.name}', 
          '${product.category}', 
          '${product.color}',
          ${product.price}
        );`
    );
  }

  console.log('creating sales');
  await client.runQuery(
    `CREATE TABLE sales (
      id INTEGER PRIMARY KEY, 
      order_timestamp TEXT, 
      region_id INT, 
      product_id INT, 
      hype INT,
      cost REAL, 
      revenue REAL
    );`
  );

  const NUM_BATCHES = 100;
  const ROWS_PER_BATCH = 100;
  for (let batch = 0; batch < NUM_BATCHES; batch++) {
    if (batch % 10 === 0) {
      console.log(
        ((batch / NUM_BATCHES) * 100).toFixed(1) + '% test db rows inserted'
      );
    }

    const values = [];
    for (let batchRow = 0; batchRow < ROWS_PER_BATCH; batchRow++) {
      const rowId = batch * ROWS_PER_BATCH + batchRow;
      const regionId = (rowId % regions.length) + 1;
      const regionMultiplier = regions[rowId % regions.length].multiplier;

      const productId = (rowId % products.length) + 1;
      const product = products[rowId % products.length];

      const hype = hypes[rowId % hypes.length];
      const orderTimestamp = moment
        .utc('2020-01-01')
        .add(rowId * 43, 'minute')
        .add(rowId * 37, 'seconds')
        .toISOString();

      const dayOfMonthMultiplier =
        (moment(orderTimestamp).date() / 31) * 0.45 + 1;
      const weekOfYearMultiplier =
        (moment(orderTimestamp).week() / 52) * 0.25 + 1;
      const minuteMultipler = (moment(orderTimestamp).minute() / 60) * 0.75 + 1;
      const secondMultipler = (moment(orderTimestamp).second() / 60) * 0.75 + 1;

      const multiplier =
        regionMultiplier *
        dayOfMonthMultiplier *
        weekOfYearMultiplier *
        minuteMultipler *
        secondMultipler;

      const cost = (product.price * 0.7 * multiplier).toFixed(2);
      const revenue = (product.price * multiplier).toFixed(2);

      values.push(`(
        ${rowId + 1}, 
        '${orderTimestamp}',
        ${regionId}, 
        ${productId}, 
        ${hype},
        ${cost}, 
        ${revenue}
      )`);
    }
    await client.runQuery(
      `INSERT INTO sales (
        id, 
        order_timestamp,
        region_id, 
        product_id, 
        hype,
        cost, 
        revenue
      ) VALUES ${values.join(', ')};`
    );
  }

  console.log('creating sales view');
  await client.runQuery(`
    CREATE VIEW vw_sales AS 
      SELECT
        sales.id,
        date(sales.order_timestamp) order_date,
        time(sales.order_timestamp) order_time,
        strftime('%H:00:00', sales.order_timestamp) AS order_hour,
        sales.order_timestamp,
        regions.region,
        products.name,
        products.category,
        products.color,
        sales.hype,
        sales.cost,
        sales.revenue
      FROM
        sales
        JOIN regions ON sales.region_id = regions.id
        JOIN products ON sales.product_id = products.id
  `);

  // Lastly create a bunch of junk tables so simulate large schemas
  console.log('creating dummy tables for large schema');
  for (let i = 0; i < 500; i++) {
    await client.runQuery(`CREATE TABLE z_fake_table_products_${i} (
      id INTEGER PRIMARY KEY, 
      name TEXT, 
      category TEXT, 
      color TEXT,
      price REAL,
      quantity INT,
      created_at DATETIME,
      updated_at DATETIME
    )`);
  }

  console.log('%s creation finished', filename);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
