import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { aDescribe } from './base/aDescribe';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { EmailManagerMock } from './base/mock/email.manager.mock';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { createErrorsMessages } from './base/utils/make-errors-messages';
import { skipSettings } from './base/utils/tests-settings';
import { wait } from './base/utils/wait';
import { userConstants } from './base/rest-models-helpers/users.constants';
import { SecurityTestManager } from './base/managers/SecurityTestManager';

aDescribe(skipSettings.for('security'))('SecurityController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let securityTestManager: SecurityTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(EmailManager).useClass(EmailManagerMock),
    );

    usersTestManager = result.usersTestManager;
    securityTestManager = new SecurityTestManager(app);
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    beforeAll(async () => {
      const inputData = usersTestManager.createInputData({});
      const userSA = await usersTestManager.createSA(inputData);

      let deviceNumber = 0;
      for (deviceNumber = 0; deviceNumber < 4; deviceNumber) {
        await securityTestManager.securityLogin(deviceNumber, inputData);
      }

      const { accessToken, refreshToken } = await usersTestManager.authLogin(
        inputData,
      );

      const activeSessions = await securityTestManager.getUserActiveSessions(
        refreshToken,
      );

      const { deviceId } = activeSessions[0];
      const sessions = activeSessions[4];

      expect.setState({
        userSA,
        userInputData: inputData,
        refreshToken,
        accessToken,
        sessions,
        deviceId,
      });
    });

    it(`/security/devices (GET) - shouldn't passed w/o or with invalid refresh token and 1 case invalid deviceId -> 404, 401`, async () => {
      const failedAttempt2GetSessions =
        await securityTestManager.getUserActiveSessions(
          userConstants.invalidData.anyData,
          HttpStatus.UNAUTHORIZED,
        );
    });

    it(`/security/devices (GET) - shouldn't delete specific session with invalid RT and deviceId; 404, 401`, async () => {
      const { refreshToken, deviceId } = expect.getState();
      const invalidDeviceId = 1;

      await securityTestManager.deleteSpecificSession(
        refreshToken,
        invalidDeviceId,
        HttpStatus.NOT_FOUND,
      );

      await securityTestManager.deleteSpecificSession(
        userConstants.invalidData.anyData,
        deviceId,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it('', async () => {});
    it('', async () => {});
    it('', async () => {});
  });
});
