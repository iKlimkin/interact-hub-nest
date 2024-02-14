import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../config/configuration';

@Injectable()
export class TypeOrmOptions implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.getOrThrow<ConfigurationType>('ENV', {
      infer: true,
    }).env;
    console.log({nodeEnv});

    if (
      (nodeEnv && nodeEnv.toUpperCase() === 'DEVELOPMENT') ||
      nodeEnv.toUpperCase() === 'TESTING'
    ) {
      console.log('dev');
      return this.createLocalConnection();
    } else {
      console.log('prod');
      return this.createLocalConnection();
    }
  }

  private createLocalConnection(): TypeOrmModuleOptions {
    console.log('local connection postgres');
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'NodeJS',
      password: 'NodeJS',
      database: 'InteractHubNest',
      autoLoadEntities: false,
      synchronize: false,
    };
  }

  private createRemoteConnection(): TypeOrmModuleOptions {
    console.log(this.configService.get('PG_REMOTE_URL'));
    return {
      type: 'postgres',
      url: this.configService.get<string>('PG_REMOTE_URL') || '',
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    };
  }
}
