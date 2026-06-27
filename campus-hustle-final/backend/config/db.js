// backend/config/db.js
'use strict';

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.db.connectionString,
  max: env.db.maxConnections,
  idleTimeoutMillis: env.db.idleTimeoutMs,
  connectionTimeoutMillis: env.db.connectionTimeoutMs,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool client error:', err.message);
});

/**
 * Execute a parameterised SQL query.
 * Returns the full pg QueryResult.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Run multiple queries in a single transaction.
 * Pass an async callback that receives a client object.
 * The transaction is automatically committed or rolled back.
 *
 * Usage:
 *   const result = await transaction(async (client) => {
 *     await client.query('INSERT ...');
 *     return client.query('SELECT ...');
 *   });
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { query, transaction };
