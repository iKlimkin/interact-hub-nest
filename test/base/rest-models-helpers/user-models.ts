import { UserViewModel } from '../../../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';

class UserValidationConstants {
  userValidationErrors = {
    errorsMessages: expect.arrayContaining([
      { message: expect.any(String), field: 'loginOrEmail' },
      { message: expect.any(String), field: 'password' },
    ]),
  };

  userModelEqualTo = {
    id: expect.any(String),
    login: expect.any(String),
    email: expect.any(String),
    createdAt: expect.any(String),
  } as UserViewModel;

 
}

export const userValidator = new UserValidationConstants();
