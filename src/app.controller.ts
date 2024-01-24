import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import { AuthConfigurationType } from './features/auth/config/configuration';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService<ConfigType>,
    private readonly configAuthService: ConfigService<AuthConfigurationType>,
    private readonly appService: AppService,
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
}
