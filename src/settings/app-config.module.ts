import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { getConfiguration } from 'src/config/configuration';

export const configModule = ConfigModule.forRoot({
  envFilePath: ['.env'], // envFilePath: ['.env.local', '.env'] prioritize
  isGlobal: true,
  load: [getConfiguration],
  cache: true,
  validationSchema: Joi.object({
    PORT: Joi.number().valid(5000),
    MONGO_URL: Joi.string().uri(),
    DB_LOCAL: Joi.string().required(),
    NODE_ENV: Joi.string(),
  }),
  expandVariables: true,
});
