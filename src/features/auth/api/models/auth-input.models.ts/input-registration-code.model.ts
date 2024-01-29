import { iSValidField } from '../../../../../infra/decorators/transform/is-valid-string';
import { frequentLength } from '../../../../../domain/validation.constants';

export class InputRegistrationCodeModel {
  @iSValidField(frequentLength)
  code: string;
}
