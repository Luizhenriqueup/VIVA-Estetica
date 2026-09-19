require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3333),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-nao-usar-em-producao',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  // Login temporario: quanto tempo a credencial provisoria vale
  tempLoginTtlHours: Number(process.env.TEMP_LOGIN_TTL_HOURS || 48),

  databaseUrl: process.env.DATABASE_URL || null,
  storageDir: process.env.STORAGE_DIR || './storage',
};

module.exports = env;
