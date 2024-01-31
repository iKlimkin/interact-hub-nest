import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { addMinutes } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AppModule } from '../../../src/app.module';
import {
    UserAccount,
    UserAccountModelType
} from '../../../src/features/admin/domain/entities/userAccount.schema';
import { ConfirmEmailCommand } from '../../../src/features/auth/application/use-cases/commands/confirm-email.command';
import { ConfirmEmailUseCase } from '../../../src/features/auth/application/use-cases/confirm-email-use-case';
import { AuthUsersRepository } from '../../../src/features/auth/infrastructure/authUsers-repository';
import { applyAppSettings } from '../../../src/settings/apply-app.settings';
import { dropDataBase } from '../../base/utils/database-clean-up';

// class MockAuthRepository {
//   async findUserByConfirmationCode(code: string, user: UserAccountDocument) {
//     return user
//   }
// }

const correctData = {
  code: 'testingCode',
};

const invalidData = {
  shortCode: '12',
  invalidCode: 123,
};

describe('CreateUserUseCase', () => {
  let confirmEmailUseCase: ConfirmEmailUseCase;
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let UserAccountModel: UserAccountModelType;
let authUsersRepository: AuthUsersRepository
  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, CqrsModule],
      providers: [
        {
          provide: getModelToken(UserAccount.name),
          useValue: UserAccountModel,
        },
      ],
    })
      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    confirmEmailUseCase =

      moduleFixture.get<ConfirmEmailUseCase>(ConfirmEmailUseCase);
    authUsersRepository =
      moduleFixture.get<AuthUsersRepository>(AuthUsersRepository);

    UserAccountModel = moduleFixture.get<UserAccountModelType>(
      getModelToken(UserAccount.name),
    );

    await app.init();

    await dropDataBase(app);
  });

  it('should create user and confirm user successfully', async () => {
    const { code } = correctData;

    await createUser(
      UserAccountModel,
      code,
      addMinutes(new Date(), 10).toISOString(),
    );

    const command = new ConfirmEmailCommand({ code });
    const result = await confirmEmailUseCase.execute(command);

    const repoSpy = jest.spyOn(authUsersRepository, 'save')
        
    expect(result?.emailConfirmation.isConfirmed).toBeTruthy();
    expect(repoSpy).toHaveBeenCalled()
  });

  it(`shouldn't pass validation`, async () => {
    // const inputUserDto = {
    //   email: invalidData.emailNoMatch,
    //   login: invalidData.loginShort,
    //   password: correctData.password,
    // };
    // const command = new ConfirmEmailCommand(inputUserDto);
    // const user = await confirmEmailUseCase.execute(command);
    // const repoSpy = jest.spyOn(mockAuthRepository, 'findUserByConfirmationCode');
    // expect(user).toBeNull()
    // expect(user).not.toBeTruthy();
    // expect(repoSpy).not.toHaveBeenCalled();
  });
});

async function createUser(
  UserAccountModel: UserAccountModelType,
  code: string,
  expirationDate: string,
  isConfirmed?: boolean,
) {
  const userData = {
    _id: new ObjectId(),
    accountData: {
      login: 'Ivan',
      email: 'email.email',
      createdAt: new Date().toISOString(),
      passwordSalt: 'string',
      passwordHash: 'string',
    },
    emailConfirmation: {
      confirmationCode: code,
      expirationDate: expirationDate,
      isConfirmed: isConfirmed ? true : false,
    },
  };

  const user = new UserAccountModel(userData);
  user.save();

  return user;
}
