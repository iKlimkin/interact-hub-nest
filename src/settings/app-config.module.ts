import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { getEnvConfiguration } from '../config/configuration';

export const configModule = ConfigModule.forRoot({
  // envFilePath: ['.env.local', '.env'] prioritize
  isGlobal: true,
  load: [getEnvConfiguration],
  cache: true,
  validationSchema: Joi.object({
    PORT: Joi.number().valid(5000),
    MONGO_URL: Joi.string().uri(),
    DB_LOCAL: Joi.string().required(),
  }),
  expandVariables: true,
});
