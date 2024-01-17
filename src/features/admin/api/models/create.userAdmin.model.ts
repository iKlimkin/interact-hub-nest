import { Matches } from 'class-validator';
import { iSValidField } from 'src/infra/decorators/transform/is-valid-string';
import {
  nameLength,
  passwordLength,
  frequentLength,
  emailMatches,
  loginMatch,
} from 'src/infra/validation.constants';

export type CreateUserDto = {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isConfirmed?: boolean;
};

export class InputUserModel {
  /**
   * user's email
   */
  @Matches(loginMatch)
  @iSValidField(nameLength)
  login: string;

  /**
   * user's registration password
   */
  @iSValidField(passwordLength)
  password: string;

  /**
   * user's registration email
   */
  @Matches(emailMatches)
  @iSValidField(frequentLength)
  email: string;
}
