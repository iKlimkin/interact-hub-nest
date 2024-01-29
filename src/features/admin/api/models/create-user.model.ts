import { iSValidField } from '../../../../infra/decorators/transform/is-valid-string';
import {
  emailMatches,
  frequentLength,
  loginLength,
  loginMatch,
  passwordLength,
} from '../../../../domain/validation.constants';

export type CreateUserDto = {
  login: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isConfirmed?: boolean;
};

export class InputUserModel {
  /**
   * user's login
   */
  @iSValidField(loginLength, loginMatch)
  login: string;

  /**
   * user's registration password
   */
  @iSValidField(passwordLength)
  password: string;

  /**
   * user's registration email
   */
  @iSValidField(frequentLength, emailMatches)
  email: string;
}
