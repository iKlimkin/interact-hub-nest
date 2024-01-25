import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../config/configuration';

export const createAsyncMongoConnection = async (
  configService: ConfigService,
) => {
  const config = configService.get<ConfigurationType>('dbConnection', {
    infer: true,
  });
  console.log(`Connecting to MongoDB ${!!config.mongo_url}`);
  return {
    uri: config.mongo_url,
  };
};
