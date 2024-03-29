import { iSValidField } from '../../../../../infra/decorators/transform/is-valid-string';
import {
  frequentLength,
  passwordLength,
} from '../../../../../domain/validation.constants';

export class InputCredentialsModel {
  /**
   * loginOrEmail of the user account
   */
  @iSValidField(frequentLength)
  loginOrEmail: string;

  /**
   * password of the user account.
   */
  @iSValidField(passwordLength)
  password: string;
}
