import { iSValidField } from "../../../../../infra/decorators/transform/is-valid-string";
import { frequentLength } from "../../../../../infra/validation.constants";

export class InputRegistrationCodeModel {
  @iSValidField(frequentLength)
  code: string;
}
