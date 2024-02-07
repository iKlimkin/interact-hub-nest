import { registerAs } from '@nestjs/config';

export const getAuthConfiguration = registerAs('auth', () => ({
  type: process.env.AUTH_TYPE ?? 'OATH2',
}));

export type AuthConfigurationType = {
  auth: ReturnType<typeof getAuthConfiguration>;
};

export const getMongoConnection = registerAs('mongoConnection', () => ({
  mongo_url: process.env.MONGO_URL,
  db_local:
    process.env.DB_LOCAL ?? `mongodb://127.0.0.1:27017/nest-studying-project`,
}));

export const getPostgresConnection = registerAs('mongoConnection', () => ({
  mongo_url: process.env.MONGO_URL,
  db_local:
    process.env.DB_LOCAL ?? `mongodb://127.0.0.1:27017/nest-studying-project`,
}));

export const getEnv = registerAs('ENV', () => ({
  env: process.env.NODE_ENV ?? `DEVELOPMENT`,
}));

export type getEnvTestingType = {
  getEnv: ReturnType<typeof getEnv>;
};

export type dbConnectionConfigType = {
  dbConnection: ReturnType<typeof getMongoConnection>;
};
