import { registerAs } from '@nestjs/config';

export const getAuthConfiguration = registerAs('auth', () => ({
  type: process.env.AUTH_TYPE ?? 'OATH2',
}));

export type AuthConfigurationType = {
  auth: ReturnType<typeof getAuthConfiguration>;
};

export const getDbConnection = registerAs('dbConnection', () => ({
  mongo_url:
    process.env.MONGO_URL ??
    `mongodb+srv://IvanKlimkin:qwerty123@cluster0.1yqqhim.mongodb.net/nest-studying-project?retryWrites=true&w=majority`,
  db_local:
    process.env.DB_LOCAL ?? `mongodb://127.0.0.1:27017/nest-studying-project`,
}));

export type dbConnectionConfigType = {
  dbConnection: ReturnType<typeof getDbConnection>;
};
