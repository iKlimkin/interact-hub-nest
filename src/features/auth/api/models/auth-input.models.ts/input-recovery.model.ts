import { iSValidField } from 'src/infra/decorators/transform/is-valid-string';
import { passwordLength, frequentLength } from 'src/infra/validation.constants';

export class InputRecoveryPassModel {
  /**
   * newPassword of the user account
   */
  @iSValidField(passwordLength)
  newPassword: string;

  /**
   * recoveryCode of the user account.
   */
  @iSValidField(frequentLength)
  recoveryCode: string;
}
