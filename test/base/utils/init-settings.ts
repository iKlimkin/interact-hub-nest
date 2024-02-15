import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../src/app.module';
import { ConfigurationType } from '../../../src/config/configuration';
import { EmailManager } from '../../../src/infra/application/managers/email-manager';
import { applyAppSettings } from '../../../src/settings/apply-app.settings';
import { UsersTestManager } from '../managers/UsersTestManager';
import { EmailManagerMock, EmailMockService } from '../mock/email.manager.mock';
import { deleteAllData } from './dataBase-clean-up';
import { SecuritySqlQueryRepo } from '../../../src/features/security/api/query-repositories/security.query.sql-repo';
import { DataSource } from 'typeorm';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailManager)
    .useValue(EmailMockService);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  // const emailManagerMock = testingAppModule.get<EmailMockService>(EmailMockService)

  const securitySqlQueryRepo = testingAppModule.get<SecuritySqlQueryRepo>(SecuritySqlQueryRepo)
  const dataBase = testingAppModule.get<DataSource>(DataSource)
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', { infer: true });
  const env = configService.get('getEnv', { infer: true });

  console.log('in tests ENV: ', { port }, env);

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
    securitySqlQueryRepo,
    dataBase,
  };
};
