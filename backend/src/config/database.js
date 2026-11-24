require('dotenv').config();

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5432),
    };

if (!connectionString && process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

const pool = new Pool({
  ...poolConfig,
  max: Number(process.env.DB_POOL_MAX || (connectionString ? 5 : 10)),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('Erro inesperado no pool PostgreSQL:', error.message);
});

module.exports = pool;
