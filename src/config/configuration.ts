export const getEnvConfiguration = () => ({
  Port: parseInt(process.env.PORT ?? '5000'),
  jwtSetting: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  },
  emailSetting: {
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  },
  authBasic: {
    HTTP_BASIC_USER: process.env.HTTP_BASIC_USER,
    HTTP_BASIC_PASS: process.env.HTTP_BASIC_PASS,
  },
  // auth: getAuthConfiguration()
});

export type ConfigurationType = ReturnType<typeof getEnvConfiguration>;

export type ConfigType = ConfigurationType & {
  MONGO_URI: string;
  MONGO_URI2: string;
  NODE_ENV: 'procudction' | 'development' | 'stage';
};
