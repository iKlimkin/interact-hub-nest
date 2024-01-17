import { Matches } from 'class-validator';
import { iSValidField } from 'src/infra/decorators/transform/is-valid-string';
import {
  emailMatches,
  frequentLength,
  loginLength,
  loginMatch,
  passwordLength,
} from 'src/infra/validation.constants';

export class InputRegistrationModel {
  /**
   * login of the registr user account
   */
  @iSValidField(loginLength, loginMatch)
  login: string;

  /**
   * password of the registr user account.
   */
  @iSValidField(passwordLength)
  password: string;

  /**
   * email of the registr user account.
   */
  @iSValidField(frequentLength, emailMatches)
  email: string;
}
