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

export const getMailerConfiguration = registerAs('eMailer', () => ({
  password: process.env.EMAIL_PASSWORD ?? 'someprotectpassword',
  email: process.env.EMAIL_USER ?? 'iklimkin50@gmail.com',
  service: process.env.EMAIL_SERVICE ?? 'gmail',
}));

export type EmailDeliveryConfigType = {
  eMailer: ReturnType<typeof getMailerConfiguration>;
};
