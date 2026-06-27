// backend/config/env.js
'use strict';

require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[CONFIG] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  db: {
    connectionString: process.env.DATABASE_URL,
    maxConnections: 20,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 2000,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  storage: {
    publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${parseInt(process.env.PORT, 10) || 5000}`,
    uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
    profileBucket: process.env.PROFILE_PICTURE_BUCKET || 'profile-pictures',
  },

  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    fromName: 'HustleGrad',
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
        ],
  },
};
