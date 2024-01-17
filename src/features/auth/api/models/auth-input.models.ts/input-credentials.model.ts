import { iSValidField } from 'src/infra/decorators/transform/is-valid-string';
import { frequentLength, passwordLength } from 'src/infra/validation.constants';

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
