import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../../src/features/auth/application/use-cases/create-user.use-case';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { UserAccountDocument } from '../../../src/features/admin/domain/entities/userAccount.schema';
import { AuthUsersRepository } from '../../../src/features/auth/infrastructure/authUsers-repository';
import {
  BcryptAdapter,
} from '../../../src/infra/adapters/bcrypt-adapter';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../base/utils/routing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app.settings';

class EventBusMock {
    publish = jest.fn();
}

class MockAuthRepository {
    async save(smartUser: UserAccountDocument): Promise<UserAccountDocument> {
        return await smartUser.save();
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

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let app: INestApplication;
  let moduleFixture: TestingModule
let eventBus: EventBus
  const dropDataBase = async () =>
    await request(app.getHttpServer()).delete(`${RouterPaths.test}`);

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, CqrsModule],
    })
      .overrideProvider(AuthUsersRepository)
      .useValue(MockAuthRepository)
      .overrideProvider(BcryptAdapter)
      .useClass(MockBcryptAdapter)
      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    eventBus = moduleFixture.get<EventBus>(EventBus)
    
    createUserUseCase = moduleFixture.get<CreateUserUseCase>(CreateUserUseCase);
    
    await app.init();


    await dropDataBase();
  });

  it('should create a user successfully', async () => {
    const inputUserDto = {
      email: 'test@example.com',
      login: 'testuser',
      password: 'testpassword',
    };

    const command = new CreateUserCommand(inputUserDto);
    
    const user = await createUserUseCase.execute(command);

    expect(user).toBeTruthy();
    expect(user?.accountData.email).toEqual(inputUserDto.email);
    expect(user?.accountData.login).toEqual(inputUserDto.login);

  });

});
