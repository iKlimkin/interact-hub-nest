import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../config/configuration';

export const createMongoConnection = async (
  configService: ConfigService,
) => {
  const config = configService.get<ConfigurationType>('mongoConnection', {
    infer: true,
  });

  console.log(
    `Connecting to MongoDB ${
      config.mongo_url
        ? 'successfully in the cluster'
        : config.db_local
          ? 'successfully locally'
          : 'not successful'
    }`,
  );
  return {
    uri: config.mongo_url || config.db_local,
  };
};
