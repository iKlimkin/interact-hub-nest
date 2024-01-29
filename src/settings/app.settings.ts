import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../config/configuration';

export const createAsyncMongoConnection = async (
  configService: ConfigService,
) => {
  const config = configService.get<ConfigurationType>('dbConnection', {
    infer: true,
  });
  console.log(`Connecting to MongoDB ${config.mongo_url ? 'successfully' : 'not successful'}`);
  return {
    uri: config.mongo_url,
  };
};
