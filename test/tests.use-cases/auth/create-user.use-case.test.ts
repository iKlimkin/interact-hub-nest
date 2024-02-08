import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../../src/features/auth/application/use-cases/create-user.use-case';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { UserAccountDocument } from '../../../src/features/admin/domain/entities/userAccount.schema';
import { AuthUsersRepository } from '../../../src/features/auth/infrastructure/auth-users.repository';
import { BcryptAdapter } from '../../../src/infra/adapters/bcrypt-adapter';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../base/utils/routing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app.settings';
import { CreateUserCommand } from '../../../src/features/auth/application/use-cases/commands/create-user.command';
import { EmailManager } from '../../../src/infra/application/managers/email-manager';
import { EmailManagerMock } from '../../base/mock/email.manager.mock';
import { dropDataBase } from '../../base/utils/dataBase-clean-up';

class MockAuthRepository {
  async save(smartUser: UserAccountDocument): Promise<UserAccountDocument> {
    return Promise.resolve(smartUser);
  }
}

class MockBcryptAdapter {
  async createHash(password: string) {
    return Promise.resolve({
      passwordSalt: 'mocked-salt',
      passwordHash: 'mocked-hash',
    });
  }
  async compareAsync(password: string, passwordHash: string) {
    await Promise.resolve();
  }
}

const correctData = {
  password: 'password',
  login: 'login',
  email: 'email@yandex.ru',
};

const invalidData = {
  passwordShort: '12345',
  passwordLong: '12345678901',
  loginShort: 'lo',
  loginLong: 'incorrectLongLogin',
  emailNoMatch: 'email',
};

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockAuthRepository: MockAuthRepository;
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mockEmailManager: EmailManagerMock;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, CqrsModule],
    })
      .overrideProvider(AuthUsersRepository)
      .useClass(MockAuthRepository)
      .overrideProvider(BcryptAdapter)
      .useClass(MockBcryptAdapter)
      .overrideProvider(EmailManager)
      .useClass(EmailManagerMock)
      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    createUserUseCase = moduleFixture.get<CreateUserUseCase>(CreateUserUseCase);

    mockAuthRepository = new MockAuthRepository();
    mockEmailManager = new EmailManagerMock();

    await app.init();

    await dropDataBase(app);
  });

  it('should create user successfully', async () => {
    const inputUserDto = {
      email: correctData.email,
      login: correctData.login,
      password: correctData.password,
    };

    const command = new CreateUserCommand(inputUserDto);
    const user = await createUserUseCase.execute(command);

    const repoSpy = jest.spyOn(mockAuthRepository, 'save');
    const emailSpy = jest.spyOn(
      mockEmailManager,
      'sendEmailConfirmationMessage',
    );

    expect(user).toBeTruthy();
    expect(user?.accountData.email).toEqual(inputUserDto.email);
    expect(user?.emailConfirmation.isConfirmed).toBeFalsy();
    expect(repoSpy).toHaveBeenCalled();
    expect(emailSpy).toHaveBeenCalled();
  });

  it(`shouldn't pass validation`, async () => {
    const inputUserDto = {
      email: invalidData.emailNoMatch,
      login: invalidData.loginShort,
      password: correctData.password,
    };

    const command = new CreateUserCommand(inputUserDto);
    const user = await createUserUseCase.execute(command);

    const repoSpy = jest.spyOn(mockAuthRepository, 'save');
    const emailSpy = jest.spyOn(
      mockEmailManager,
      'sendEmailConfirmationMessage',
    );
    expect(() => createUserUseCase.execute(command)).toThrow();
    expect(user).toBeNull();
    expect(user).not.toBeTruthy();
    expect(repoSpy).not.toHaveBeenCalled();
    expect(emailSpy).not.toHaveBeenCalled();
  });
});
