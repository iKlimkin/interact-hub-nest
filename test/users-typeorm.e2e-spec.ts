import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SAViewModel } from '../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';
import { aDescribe } from './base/aDescribe';
import { SATestManager } from './base/managers/SATestManager';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { PaginationModel } from './base/utils/pagination-model';
import { skipSettings } from './base/utils/tests-settings';
import request from 'supertest';

aDescribe(skipSettings.for('sa'))('saController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let saTestManager: SATestManager;
  let dataBase: DataSource;
  let paginationModel: PaginationModel<SAViewModel>;

  beforeAll(async () => {
    const appSettings = await initSettings();

    // usersTestManager = appSettings.usersTestManager;
    app = appSettings.app;

    paginationModel = new PaginationModel();
    saTestManager = new SATestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create SA', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    it('', () => {});

    it('', () => {});
  });
});
