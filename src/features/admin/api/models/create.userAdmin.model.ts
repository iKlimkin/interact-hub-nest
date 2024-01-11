import { Matches } from 'class-validator';
import { iSValidString } from 'src/infra/decorators/is-valid-string';
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
  isConfirmed: boolean;
};

export class InputUserModel {
  /**
   * user's email
   */
  @Matches(loginMatch)
  @iSValidString(nameLength)
  login: string;

  /**
   * user's registration password
   */
  @iSValidString(passwordLength)
  password: string;

  /**
   * user's registration email
   */
  @Matches(emailMatches)
  @iSValidString(frequentLength)
  email: string;
}
