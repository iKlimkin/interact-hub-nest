

//  .overrideProvider(UsersService)

import { UsersQueryRepository } from "src/features/admin/api/query-repositories/users.query.repo";

//  .useValue(UserServiceMockObject)
export const UserServiceMockObject = {
  sendMessageOnEmail: jest.fn().mockImplementation(async () => {
    console.log('Call mock method sendPasswordRecoveryMail / MailService');
    return true;
  }),
};

//  .overrideProvider(UsersService)
//  .useClass(UserServiceMock)
// or
// .overrideProvider(UsersService)
// .useFactory({
//      factory: (usersRepo: UsersRepository) => {
//          return new UserServiceMock(usersRepo);
//      },
//      inject: [UsersRepository]
//      }
//     )
export class UserServiceMock {
  constructor(private usersQueryRepo: UsersQueryRepository) {}

  sendMessageOnEmail: () => true;
}
