import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import { AuthConfigurationType } from './config/env-configurations';
import { seedAllData } from './infra/utils/seed/seed-data';
import { DataSource } from 'typeorm';

@Controller('app')
export class AppController {
  constructor(
    private readonly configService: ConfigService<ConfigType>,
    private readonly configAuthService: ConfigService<AuthConfigurationType>,
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): any {
    return {
      hello: this.appService.getHello(),
      env: this.configService.get('NODE_ENV', { infer: true }),
      auth: this.configAuthService.get('auth', { infer: true }),
      // auth: this.configService.get('auth', { infer: true })?.type
    };
  }

  @Post()
  async seedData() {
    await seedAllData(this.dataSource);
  }
}
