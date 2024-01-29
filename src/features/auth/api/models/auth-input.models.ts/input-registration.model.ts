import { iSValidField } from '../../../../../infra/decorators/transform/is-valid-string';
import {
  loginLength,
  loginMatch,
  passwordLength,
  frequentLength,
  emailMatches,
} from '../../../../../domain/validation.constants';

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
