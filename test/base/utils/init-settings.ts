import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../src/app.module';
import { ConfigurationType } from '../../../src/config/configuration';
import { EmailManager } from '../../../src/infra/application/managers/email-manager';
import { applyAppSettings } from '../../../src/settings/apply-app.settings';
import { UsersTestManager } from '../managers/UsersTestManager';
import { EmailManagerMock } from '../mock/email.manager.mock';
import { deleteAllData } from './dataBase-clean-up';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const configService = new ConfigService();
  const config = configService.get<ConfigurationType>('ENV', { infer: true });
  console.log('in tests ENV: ', {config}, {configService});

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailManager)
    .useValue(EmailManagerMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  applyAppSettings(app);
  await app.init();

  const usersTestManager = new UsersTestManager(app);
  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  await deleteAllData(databaseConnection);

  return {
    app,
    databaseConnection,
    httpServer,
    usersTestManager,
  };
};
