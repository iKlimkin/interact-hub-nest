import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { aDescribe } from './base/aDescribe';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { EmailMockService } from './base/mock/email.manager.mock';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { skipSettings } from './base/utils/tests-settings';
import { SATestManager } from './base/managers/SATestManager';
import { DataSource } from 'typeorm';
import { AuthUserType } from '../src/features/auth/api/models/auth.output.models/auth.user.types';
import { PaginationModel } from './base/utils/pagination-model';
import { SAViewModel } from '../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';
import { createSADataForTest } from './base/rest-models-helpers/users.constants';

aDescribe(skipSettings.for('sa'))('saController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let saTestManager: SATestManager;
  let dataBase: DataSource;
  let paginationModel: PaginationModel<SAViewModel>

  beforeAll(async () => {
    const appSettings = await initSettings();

    // usersTestManager = appSettings.usersTestManager;
    app = appSettings.app;

    paginationModel = new PaginationModel()
    saTestManager = new SATestManager(app);

    await dropDataBase(app);
  });
  
  afterAll(async () => {
    await app.close();
  });

  describe('create SA', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    it(`/sa/users (POST) - should create sa, 201`, async () => {
      let i = 1;
      const paginationData: AuthUserType[] = [];

      while (i !== 10) {
        const inputData = saTestManager.createInputData({}, i);
        paginationData.push(inputData);
        i++;

        await saTestManager.createSA(inputData);
        expect.setState({ paginationData })
      }
    });

    it(`/sa/users (GET) - test pagination sa, 200`, async () => {
      const { paginationData } = expect.getState()
      
      let data = {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 9,
        items: paginationData,
      }
      console.log(data);
      
      const query1 = {};
      
      const defaultSADataTest = createSADataForTest()

      let data2 = {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 9,
        items: defaultSADataTest,
      }
      const datapg = paginationModel.getData(data2)
      console.log(datapg);

      // defaultSADataTest.sort((a, b) => b.createdAt.).map(u => u)
      console.log({defaultSADataTest});
      const res = await saTestManager.getSAPagination()
      console.log({res});
      
      // const result1 = await saTestManager.getSAPagination(query1, defaultSATestModel);

      const query2 = { searchLoginTerm: 'ykt91Ue6F3' };
      
      // const result2 = await saTestManager.getSAPagination(query2, defaultSATestModel)
      
      const query3 = { searchEmailTerm: 'qwert5wq@yaol.com' }



      const query4 = {
        pageSize: 3,
        pageNumber: 2,
        sortDirection: 'asc',
        sortBy: 'login',
      };

    });
  });
});
